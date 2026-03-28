import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTicketGeneratedEvent,
  buildTicketQrPayload,
  issueTicketArtifact
} from "../services/shared/ticketArtifactGeneration.js";

const REGISTRATION = {
  registrationId: "reg-900",
  eventId: "event-900",
  participantId: "participant-900",
  status: "CONFIRMED"
};

const EVENT = {
  eventId: "event-900",
  title: "Data Summit",
  startAt: "2026-05-10T08:30:00.000Z"
};

test("buildTicketQrPayload builds opaque verification path", () => {
  const qr = buildTicketQrPayload({
    ticketId: "ticket-qr-1",
    ticketRef: "TCK-DATASUMM-20260510-QR0001",
    eventId: "event-900"
  });

  assert.equal(qr.format, "OPAQUE_URL");
  assert.equal(qr.path, "/api/tickets/verify/ticket-qr-1");
  assert.equal(qr.encodedValue, "/api/tickets/verify/ticket-qr-1");
  assert.equal(qr.verification.ticketId, "ticket-qr-1");
  assert.equal(qr.verification.ticketRef, "TCK-DATASUMM-20260510-QR0001");
  assert.equal(qr.verification.eventId, "event-900");
});

test("issueTicketArtifact embeds qr metadata when enabled", () => {
  const response = issueTicketArtifact({
    registration: REGISTRATION,
    event: EVENT,
    ticketId: "ticket-qr-2",
    qrCodeEnabled: true
  });

  assert.equal(response.ok, true);
  assert.equal(response.data.ticket.qrCodeEnabled, true);
  assert.equal(response.data.ticket.qrCode.format, "OPAQUE_URL");
  assert.equal(
    response.data.ticket.qrCode.path,
    "/api/tickets/verify/ticket-qr-2"
  );
  assert.equal(
    response.data.ticket.qrCode.verification.ticketRef,
    response.data.ticket.ticketRef
  );
});

test("issueTicketArtifact keeps qr metadata null when disabled", () => {
  const response = issueTicketArtifact({
    registration: REGISTRATION,
    event: EVENT,
    ticketId: "ticket-qr-3",
    qrCodeEnabled: false
  });

  assert.equal(response.ok, true);
  assert.equal(response.data.ticket.qrCodeEnabled, false);
  assert.equal(response.data.ticket.qrCode, null);
});

test("buildTicketGeneratedEvent exposes qr path but no sensitive verification payload", () => {
  const response = issueTicketArtifact({
    registration: REGISTRATION,
    event: EVENT,
    ticketId: "ticket-qr-4",
    qrCodeEnabled: true
  });

  const event = buildTicketGeneratedEvent({
    ticket: response.data.ticket
  });

  assert.equal(event.data.qrCodeEnabled, true);
  assert.deepEqual(event.data.qrCode, {
    format: "OPAQUE_URL",
    path: "/api/tickets/verify/ticket-qr-4"
  });
  assert.equal("verification" in event.data.qrCode, false);
  assert.equal(event.data.qrCode.path.includes("participant-900"), false);
  assert.equal(event.data.qrCode.path.includes("reg-900"), false);
});

test("issueTicketArtifact reuses existing issued ticket qr metadata idempotently", () => {
  const response = issueTicketArtifact({
    registration: REGISTRATION,
    event: EVENT,
    existingTicket: {
      ticketId: "ticket-qr-5",
      ticketRef: "TCK-DATASUMM-20260510-QR0005",
      registrationId: "reg-900",
      eventId: "event-900",
      participantId: "participant-900",
      status: "ISSUED",
      artifactFormat: "PDF",
      artifactUrl: "https://media/tickets/ticket-qr-5.pdf",
      artifactFilename: "TCK-DATASUMM-20260510-QR0005.pdf",
      artifactContentType: "application/pdf",
      qrCodeEnabled: true,
      qrCode: {
        format: "OPAQUE_URL",
        path: "/api/tickets/verify/ticket-qr-5",
        encodedValue: "/api/tickets/verify/ticket-qr-5",
        verification: {
          ticketId: "ticket-qr-5",
          ticketRef: "TCK-DATASUMM-20260510-QR0005",
          eventId: "event-900"
        }
      },
      issuedAt: "2026-05-10T08:45:00.000Z"
    }
  });

  assert.equal(response.ok, true);
  assert.equal(response.statusCode, 200);
  assert.equal(response.data.ticket.qrCodeEnabled, true);
  assert.equal(
    response.data.ticket.qrCode.path,
    "/api/tickets/verify/ticket-qr-5"
  );
});
