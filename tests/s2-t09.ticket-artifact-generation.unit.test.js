import assert from "node:assert/strict";
import test from "node:test";

import {
  buildParticipantTicketAccess,
  buildTicketArtifactFilename,
  buildTicketGeneratedEvent,
  buildTicketReference,
  issueTicketArtifact,
  normalizeArtifactFormat
} from "../services/shared/ticketArtifactGeneration.js";

const REGISTRATION = {
  registrationId: "reg-123",
  eventId: "event-456",
  participantId: "participant-789",
  status: "CONFIRMED"
};

const EVENT = {
  eventId: "event-456",
  title: "Tech Day Casablanca",
  startAt: "2026-04-02T09:00:00.000Z"
};

test("normalizeArtifactFormat defaults to PDF and accepts PNG", () => {
  assert.equal(normalizeArtifactFormat("png"), "PNG");
  assert.equal(normalizeArtifactFormat("doc"), "PDF");
});

test("buildTicketReference builds stable readable reference", () => {
  const ref = buildTicketReference({
    eventTitle: EVENT.title,
    eventStartAt: EVENT.startAt,
    ticketId: "ticket_abcdef123456"
  });

  assert.match(ref, /^TCK-TECHDAYC-20260402-123456$/);
});

test("buildTicketArtifactFilename aligns extension with artifact format", () => {
  assert.equal(
    buildTicketArtifactFilename("TCK-TECHDAYC-20260402-123456", {
      artifactFormat: "PDF"
    }),
    "TCK-TECHDAYC-20260402-123456.pdf"
  );
  assert.equal(
    buildTicketArtifactFilename("TCK-TECHDAYC-20260402-123456", {
      artifactFormat: "PNG"
    }),
    "TCK-TECHDAYC-20260402-123456.png"
  );
});

test("issueTicketArtifact issues a PDF ticket and exposes participant download fields", () => {
  const response = issueTicketArtifact({
    registration: REGISTRATION,
    event: EVENT,
    ticketId: "ticket-1",
    correlationId: "corr-1",
    issuedAt: "2026-04-02T08:45:00.000Z"
  });

  assert.equal(response.ok, true);
  assert.equal(response.statusCode, 201);
  assert.equal(response.data.ticket.status, "ISSUED");
  assert.equal(response.data.ticket.artifactFormat, "PDF");
  assert.equal(response.data.ticket.artifactContentType, "application/pdf");
  assert.equal(response.data.registrationProjection.canDownloadTicket, true);
  assert.equal(response.data.registrationProjection.ticketId, "ticket-1");
  assert.equal(response.data.event.eventName, "ticket.generated");
  assert.equal(response.audit.action, "TICKET_ISSUED");
});

test("issueTicketArtifact supports PNG artifact generation", () => {
  const response = issueTicketArtifact({
    registration: REGISTRATION,
    event: EVENT,
    ticketId: "ticket-2",
    artifactFormat: "PNG"
  });

  assert.equal(response.ok, true);
  assert.equal(response.data.ticket.artifactFormat, "PNG");
  assert.equal(response.data.ticket.artifactContentType, "image/png");
  assert.match(response.data.ticket.artifactFilename, /\.png$/);
  assert.match(response.data.ticket.artifactUrl, /\.png$/);
});

test("issueTicketArtifact rejects non confirmed registrations", () => {
  const response = issueTicketArtifact({
    registration: {
      ...REGISTRATION,
      status: "WAITLISTED"
    },
    event: EVENT
  });

  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 409);
  assert.equal(response.error.code, "REGISTRATION_NOT_CONFIRMED");
});

test("issueTicketArtifact reuses existing issued ticket idempotently", () => {
  const response = issueTicketArtifact({
    registration: REGISTRATION,
    event: EVENT,
    correlationId: "corr-2",
    existingTicket: {
      ticketId: "ticket-3",
      ticketRef: "TCK-TECHDAYC-20260402-ABC123",
      registrationId: "reg-123",
      eventId: "event-456",
      participantId: "participant-789",
      status: "ISSUED",
      artifactFormat: "PDF",
      artifactUrl: "https://media/tickets/ticket-3.pdf",
      artifactFilename: "TCK-TECHDAYC-20260402-ABC123.pdf",
      artifactContentType: "application/pdf",
      issuedAt: "2026-04-02T08:45:00.000Z"
    }
  });

  assert.equal(response.ok, true);
  assert.equal(response.statusCode, 200);
  assert.equal(response.data.ticket.ticketId, "ticket-3");
  assert.equal(response.data.ticket.ticketRef, "TCK-TECHDAYC-20260402-ABC123");
  assert.equal(response.audit.action, "TICKET_ISSUE_REUSED");
});

test("issueTicketArtifact rejects voided ticket reuse", () => {
  const response = issueTicketArtifact({
    registration: REGISTRATION,
    event: EVENT,
    existingTicket: {
      ticketId: "ticket-4",
      registrationId: "reg-123",
      status: "VOIDED"
    }
  });

  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 409);
  assert.equal(response.error.code, "TICKET_ALREADY_VOIDED");
});

test("buildParticipantTicketAccess hides download when ticket is not issued", () => {
  const projection = buildParticipantTicketAccess({
    registrationStatus: "CONFIRMED",
    ticketId: "ticket-5",
    artifactFormat: "PDF",
    ticketStatus: "PENDING"
  });

  assert.equal(projection.canDownloadTicket, false);
  assert.equal(projection.ticketId, null);
});

test("buildTicketGeneratedEvent builds canonical payload", () => {
  const event = buildTicketGeneratedEvent({
    ticket: {
      ticketId: "ticket-6",
      ticketRef: "TCK-TECHDAYC-20260402-ABC999",
      registrationId: "reg-123",
      eventId: "event-456",
      participantId: "participant-789",
      artifactFormat: "PDF",
      artifactUrl: "https://media/tickets/ticket-6.pdf",
      qrCodeEnabled: false,
      issuedAt: "2026-04-02T08:45:00.000Z",
      correlationId: "corr-6"
    }
  });

  assert.equal(event.eventName, "ticket.generated");
  assert.equal(event.version, 1);
  assert.equal(event.producer, "ticketing-service");
  assert.equal(event.data.ticketId, "ticket-6");
  assert.equal(event.data.registrationId, "reg-123");
  assert.equal(event.correlationId, "corr-6");
});
