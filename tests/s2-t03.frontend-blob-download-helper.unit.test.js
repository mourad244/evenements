import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTicketDownloadPath,
  downloadProtectedTicket,
  isTicketDownloadEligible,
  mapTicketDownloadError,
  resolveDownloadFilename
} from "../services/shared/ticketDownloadHelper.js";

function createFetchMock(handler) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return handler(url, init);
  };
  fetchImpl.calls = calls;
  return fetchImpl;
}

test("isTicketDownloadEligible enforces status + flag + ticketId", () => {
  assert.equal(
    isTicketDownloadEligible({
      registrationStatus: "CONFIRMED",
      canDownloadTicket: true,
      ticketId: "t-1"
    }),
    true
  );

  assert.equal(
    isTicketDownloadEligible({
      registrationStatus: "WAITLISTED",
      canDownloadTicket: true,
      ticketId: "t-1"
    }),
    false
  );

  assert.equal(
    isTicketDownloadEligible({
      registrationStatus: "CONFIRMED",
      canDownloadTicket: false,
      ticketId: "t-1"
    }),
    false
  );
});

test("buildTicketDownloadPath encodes ticket id safely", () => {
  assert.equal(
    buildTicketDownloadPath("ticket/alpha"),
    "/api/tickets/ticket%2Falpha/download"
  );
  assert.throws(() => buildTicketDownloadPath("  "), /ticketId is required/);
});

test("resolveDownloadFilename supports RFC5987 and classic filename forms", () => {
  const utf8Headers = new Headers({
    "content-disposition": "attachment; filename*=UTF-8''billet%20final.pdf"
  });
  assert.equal(resolveDownloadFilename(utf8Headers), "billet final.pdf");

  const plainHeaders = new Headers({
    "content-disposition": 'attachment; filename="ticket-1.pdf"'
  });
  assert.equal(resolveDownloadFilename(plainHeaders), "ticket-1.pdf");

  assert.equal(resolveDownloadFilename(new Headers(), "fallback.pdf"), "fallback.pdf");
});

test("downloadProtectedTicket sends bearer header and returns blob payload", async () => {
  const fetchMock = createFetchMock(() =>
    Promise.resolve(
      new Response("PDF-CONTENT", {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": 'attachment; filename="ticket-123.pdf"'
        }
      })
    )
  );

  const result = await downloadProtectedTicket({
    fetchImpl: fetchMock,
    ticketId: "ticket-123",
    accessToken: "token-abc",
    correlationId: "corr-1"
  });

  assert.equal(result.ok, true);
  assert.equal(result.filename, "ticket-123.pdf");
  assert.equal(result.contentType, "application/pdf");
  assert.equal(await result.blob.text(), "PDF-CONTENT");

  assert.equal(fetchMock.calls.length, 1);
  assert.equal(fetchMock.calls[0].url, "/api/tickets/ticket-123/download");
  assert.ok(!fetchMock.calls[0].url.includes("token-abc"));
  assert.equal(
    fetchMock.calls[0].init.headers.authorization,
    "Bearer token-abc"
  );
  assert.equal(fetchMock.calls[0].init.headers["x-correlation-id"], "corr-1");
});

test("downloadProtectedTicket maps expected error statuses", async () => {
  const statuses = [401, 403, 404, 502];
  for (const status of statuses) {
    const fetchMock = createFetchMock(() =>
      Promise.resolve(new Response("", { status }))
    );
    const result = await downloadProtectedTicket({
      fetchImpl: fetchMock,
      ticketId: "ticket-x",
      accessToken: "token"
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, status);
    assert.equal(result.code, mapTicketDownloadError(status).code);
  }
});

test("downloadProtectedTicket returns 401 mapping when token is missing", async () => {
  const fetchMock = createFetchMock(() =>
    Promise.resolve(new Response("", { status: 200 }))
  );
  const result = await downloadProtectedTicket({
    fetchImpl: fetchMock,
    ticketId: "ticket-x",
    accessToken: ""
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  assert.equal(result.code, "UNAUTHENTICATED");
  assert.equal(fetchMock.calls.length, 0);
});

test("downloadProtectedTicket maps network failures to upstream unavailable", async () => {
  const fetchMock = createFetchMock(() => {
    throw new Error("network down");
  });

  const result = await downloadProtectedTicket({
    fetchImpl: fetchMock,
    ticketId: "ticket-x",
    accessToken: "token"
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 502);
  assert.equal(result.code, "UPSTREAM_UNAVAILABLE");
  assert.equal(result.retryable, true);
  assert.equal(result.error, "network down");
});
