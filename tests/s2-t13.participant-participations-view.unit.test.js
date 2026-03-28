import assert from "node:assert/strict";
import test from "node:test";

import {
  buildParticipantParticipationsViewModel,
  handleParticipantTicketDownload
} from "../services/shared/participantParticipationsView.js";

test("buildParticipantParticipationsViewModel maps history items to participant rows", () => {
  const viewModel = buildParticipantParticipationsViewModel({
    historyResponse: {
      items: [
        {
          registrationId: "reg-1",
          eventId: "event-1",
          eventTitle: "Forum Tech",
          registrationStatus: "CONFIRMED",
          canDownloadTicket: true,
          ticketId: "ticket-1"
        },
        {
          registrationId: "reg-2",
          eventId: "event-2",
          eventTitle: "Data Day",
          registrationStatus: "WAITLISTED",
          canDownloadTicket: false,
          ticketId: ""
        }
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: 2,
        totalPages: 1
      },
      correlationId: "corr-1"
    }
  });

  assert.equal(viewModel.items.length, 2);
  assert.equal(viewModel.items[0].ticketCta.show, true);
  assert.equal(viewModel.items[0].ticketCta.action, "DOWNLOAD");
  assert.equal(viewModel.items[1].ticketCta.show, false);
  assert.equal(viewModel.pagination.totalItems, 2);
  assert.equal(viewModel.correlationId, "corr-1");
});

test("buildParticipantParticipationsViewModel defaults missing history payload safely", () => {
  const viewModel = buildParticipantParticipationsViewModel({});
  assert.deepEqual(viewModel.items, []);
  assert.equal(viewModel.pagination.page, 1);
  assert.equal(viewModel.pagination.pageSize, 20);
});

test("handleParticipantTicketDownload delegates successful confirmed download flow", async () => {
  const result = await handleParticipantTicketDownload({
    participation: {
      registrationStatus: "CONFIRMED",
      canDownloadTicket: true,
      ticketId: "ticket-42"
    },
    accessToken: "token",
    correlationId: "corr-2",
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
});

test("handleParticipantTicketDownload preserves blocked waitlist flow", async () => {
  const result = await handleParticipantTicketDownload({
    participation: {
      registrationStatus: "WAITLISTED",
      canDownloadTicket: false,
      ticketId: ""
    },
    accessToken: "token",
    fetchImpl: () => {
      throw new Error("fetch should not be called");
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocked, true);
  assert.match(result.message, /waitlist/i);
});
