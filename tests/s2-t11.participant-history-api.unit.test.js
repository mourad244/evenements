import assert from "node:assert/strict";
import test from "node:test";

import {
  buildParticipantHistoryResponse,
  mapParticipationView,
  normalizeParticipantHistoryQuery
} from "../services/shared/participantHistoryApi.js";

const SAMPLE_REGISTRATIONS = [
  {
    registrationId: "reg-1",
    eventId: "event-1",
    eventTitle: "Tech Forum",
    eventStartAt: "2026-04-20T09:00:00.000Z",
    eventCity: "Casablanca",
    eventStatus: "PUBLISHED",
    registrationStatus: "CONFIRMED",
    canDownloadTicket: true,
    ticketId: "ticket-1",
    ticketFormat: "PDF",
    updatedAt: "2026-04-10T10:00:00.000Z",
    participantId: "participant-1"
  },
  {
    registrationId: "reg-2",
    eventId: "event-2",
    eventTitle: "Data Day",
    eventStartAt: "2026-04-10T08:00:00.000Z",
    eventCity: "Rabat",
    eventStatus: "FULL",
    registrationStatus: "WAITLISTED",
    waitlistPosition: 2,
    canDownloadTicket: false,
    ticketId: null,
    updatedAt: "2026-04-09T08:00:00.000Z",
    participantId: "participant-1"
  },
  {
    registrationId: "reg-3",
    eventId: "event-3",
    eventTitle: "AI Meetup",
    eventStartAt: "2026-04-21T18:00:00.000Z",
    eventCity: "Marrakech",
    eventStatus: "PUBLISHED",
    registrationStatus: "CONFIRMED",
    canDownloadTicket: true,
    ticketId: "ticket-3",
    ticketFormat: "PNG",
    updatedAt: "2026-04-11T08:30:00.000Z",
    participantId: "participant-2"
  }
];

test("normalizeParticipantHistoryQuery defaults paging and normalizes status", () => {
  const normalized = normalizeParticipantHistoryQuery({
    status: ["confirmed", "waitlisted"],
    page: "2",
    pageSize: "10"
  });

  assert.equal(normalized.ok, true);
  assert.deepEqual(normalized.data.status, ["CONFIRMED", "WAITLISTED"]);
  assert.equal(normalized.data.page, 2);
  assert.equal(normalized.data.pageSize, 10);
});

test("normalizeParticipantHistoryQuery rejects invalid status filter", () => {
  const normalized = normalizeParticipantHistoryQuery({
    status: ["confirmed", "unknown"]
  });

  assert.equal(normalized.ok, false);
  assert.ok(normalized.errors.includes("INVALID_STATUS_FILTER"));
});

test("mapParticipationView keeps ticket download fields only when allowed", () => {
  const confirmed = mapParticipationView(SAMPLE_REGISTRATIONS[0]);
  assert.equal(confirmed.canDownloadTicket, true);
  assert.equal(confirmed.ticketId, "ticket-1");
  assert.equal(confirmed.ticketFormat, "PDF");

  const waitlisted = mapParticipationView(SAMPLE_REGISTRATIONS[1]);
  assert.equal(waitlisted.canDownloadTicket, false);
  assert.equal(waitlisted.ticketId, null);
  assert.equal(waitlisted.ticketFormat, null);
});

test("buildParticipantHistoryResponse returns 401 for unauthenticated actor", () => {
  const response = buildParticipantHistoryResponse({
    registrations: SAMPLE_REGISTRATIONS,
    actor: {}
  });

  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 401);
});

test("buildParticipantHistoryResponse returns 403 for non participant actor", () => {
  const response = buildParticipantHistoryResponse({
    registrations: SAMPLE_REGISTRATIONS,
    actor: { role: "ORGANIZER", organizerId: "org-1" }
  });

  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 403);
});

test("buildParticipantHistoryResponse scopes rows to the authenticated participant", () => {
  const response = buildParticipantHistoryResponse({
    registrations: SAMPLE_REGISTRATIONS,
    actor: { role: "PARTICIPANT", participantId: "participant-1" },
    correlationId: "corr-1"
  });

  assert.equal(response.ok, true);
  assert.equal(response.statusCode, 200);
  assert.equal(response.data.items.length, 2);
  assert.equal(response.data.items[0].registrationId, "reg-1");
  assert.equal(response.data.items[1].registrationId, "reg-2");
  assert.equal("participantId" in response.data.items[0], false);
  assert.equal(response.audit.action, "PARTICIPATION_HISTORY_VIEWED");
});

test("buildParticipantHistoryResponse filters by status and paginates", () => {
  const response = buildParticipantHistoryResponse({
    registrations: SAMPLE_REGISTRATIONS,
    actor: { role: "PARTICIPANT", participantId: "participant-1" },
    query: {
      status: "WAITLISTED",
      page: 1,
      pageSize: 10
    }
  });

  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.items[0].registrationId, "reg-2");
  assert.equal(response.data.pagination.totalItems, 1);
});

test("buildParticipantHistoryResponse rejects invalid filters", () => {
  const response = buildParticipantHistoryResponse({
    registrations: SAMPLE_REGISTRATIONS,
    actor: { role: "PARTICIPANT", participantId: "participant-1" },
    query: {
      status: "INVALID"
    }
  });

  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 400);
  assert.equal(response.error.code, "INVALID_FILTERS");
});
