import assert from "node:assert/strict";
import test from "node:test";

import {
  downloadTicketWithUx,
  mapTicketDownloadResultToUx,
  resolveTicketDownloadAvailability
} from "../services/shared/ticketDownloadUx.js";

test("resolveTicketDownloadAvailability blocks waitlisted and cancelled statuses", () => {
  const waitlisted = resolveTicketDownloadAvailability(
    {
      registrationStatus: "WAITLISTED",
      canDownloadTicket: false,
      ticketId: ""
    },
    { actor: "participant" }
  );
  assert.equal(waitlisted.canDownload, false);
  assert.match(waitlisted.message, /waitlist/i);

  const cancelled = resolveTicketDownloadAvailability(
    {
      registrationStatus: "CANCELLED",
      canDownloadTicket: false,
      ticketId: ""
    },
    { actor: "organizer" }
  );
  assert.equal(cancelled.canDownload, false);
  assert.match(cancelled.message, /cancelled/i);
});

test("resolveTicketDownloadAvailability returns pending for confirmed without ticket id", () => {
  const pending = resolveTicketDownloadAvailability(
    {
      registrationStatus: "CONFIRMED",
      canDownloadTicket: false,
      ticketId: ""
    },
    { actor: "participant" }
  );
  assert.equal(pending.canDownload, false);
  assert.equal(pending.action, "WAIT");
  assert.match(pending.message, /generated/i);
});

test("mapTicketDownloadResultToUx maps required errors to readable copy", () => {
  const cases = [401, 403, 404, 502];
  for (const status of cases) {
    const mapped = mapTicketDownloadResultToUx(
      {
        ok: false,
        status,
        code: `E_${status}`,
        retryable: status === 502
      },
      { actor: "participant" }
    );
    assert.equal(mapped.ok, false);
    assert.equal(mapped.status, status);
    assert.equal(typeof mapped.message, "string");
    assert.ok(mapped.message.length > 8);
  }
});

test("mapTicketDownloadResultToUx provides organizer-specific language", () => {
  const mapped = mapTicketDownloadResultToUx(
    {
      ok: false,
      status: 404,
      code: "TICKET_NOT_READY",
      retryable: false
    },
    { actor: "organizer" }
  );

  assert.equal(mapped.ok, false);
  assert.match(mapped.message, /participant/i);
});

test("downloadTicketWithUx short-circuits when registration is not eligible", async () => {
  const result = await downloadTicketWithUx({
    registration: {
      registrationStatus: "WAITLISTED",
      canDownloadTicket: false,
      ticketId: ""
    },
    actor: "participant",
    ticketId: "ticket-1",
    accessToken: "token",
    fetchImpl: () => {
      throw new Error("fetch should not be called");
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocked, true);
  assert.match(result.message, /waitlist/i);
});

test("downloadTicketWithUx returns success message for participant", async () => {
  const result = await downloadTicketWithUx({
    registration: {
      registrationStatus: "CONFIRMED",
      canDownloadTicket: true,
      ticketId: "ticket-42"
    },
    actor: "participant",
    ticketId: "ticket-42",
    accessToken: "token",
    fetchImpl: () =>
      Promise.resolve(
        new Response("PDF", {
          status: 200,
          headers: {
            "content-type": "application/pdf",
            "content-disposition": 'attachment; filename="ticket-42.pdf"'
          }
        })
      )
  });

  assert.equal(result.ok, true);
  assert.equal(result.blocked, false);
  assert.match(result.message, /success/i);
});

test("downloadTicketWithUx maps downstream failures to readable message", async () => {
  const result = await downloadTicketWithUx({
    registration: {
      registrationStatus: "CONFIRMED",
      canDownloadTicket: true,
      ticketId: "ticket-42"
    },
    actor: "organizer",
    ticketId: "ticket-42",
    accessToken: "token",
    fetchImpl: () => Promise.resolve(new Response("", { status: 502 }))
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocked, false);
  assert.equal(result.status, 502);
  assert.match(result.message, /temporarily unavailable/i);
});
