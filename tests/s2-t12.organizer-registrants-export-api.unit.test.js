import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRegistrantsExportRequest,
  buildRegistrantsExportStatus,
  canAccessOrganizerRegistrants,
  mapRegistrantExportRow,
  normalizeRegistrantsExportFormat
} from "../services/shared/organizerRegistrantsExportApi.js";

const SAMPLE_EVENT = {
  eventId: "event-1",
  organizerId: "org-1",
  title: "Tech Forum"
};

const SAMPLE_REGISTRATIONS = [
  {
    registrationId: "reg-1",
    eventId: "event-1",
    eventTitle: "Tech Forum",
    participantName: "Samir",
    participantEmail: "samir@example.com",
    registrationStatus: "CONFIRMED",
    ticketRef: "TCK-001",
    ticketStatus: "ISSUED",
    registeredAt: "2026-04-10T08:00:00.000Z",
    updatedAt: "2026-04-10T08:05:00.000Z"
  },
  {
    registrationId: "reg-2",
    eventId: "event-1",
    eventTitle: "Tech Forum",
    participantName: "Nora",
    participantEmail: "nora@example.com",
    registrationStatus: "WAITLISTED",
    waitlistPosition: 1,
    ticketRef: null,
    ticketStatus: null,
    registeredAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-10T09:05:00.000Z"
  },
  {
    registrationId: "reg-3",
    eventId: "event-2",
    eventTitle: "Data Day",
    participantName: "Ali",
    participantEmail: "ali@example.com",
    registrationStatus: "CONFIRMED",
    ticketRef: "TCK-003",
    ticketStatus: "ISSUED",
    registeredAt: "2026-04-11T10:00:00.000Z",
    updatedAt: "2026-04-11T10:10:00.000Z"
  }
];

test("normalizeRegistrantsExportFormat accepts csv only", () => {
  assert.equal(normalizeRegistrantsExportFormat("csv"), "CSV");
  assert.equal(normalizeRegistrantsExportFormat("xlsx"), null);
});

test("canAccessOrganizerRegistrants allows admin and owner organizer", () => {
  assert.equal(
    canAccessOrganizerRegistrants({
      actorRole: "ADMIN",
      actorOrganizerId: "org-2",
      eventOwnerOrganizerId: "org-1"
    }),
    true
  );
  assert.equal(
    canAccessOrganizerRegistrants({
      actorRole: "ORGANIZER",
      actorOrganizerId: "org-1",
      eventOwnerOrganizerId: "org-1"
    }),
    true
  );
  assert.equal(
    canAccessOrganizerRegistrants({
      actorRole: "ORGANIZER",
      actorOrganizerId: "org-2",
      eventOwnerOrganizerId: "org-1"
    }),
    false
  );
});

test("mapRegistrantExportRow normalizes export columns", () => {
  const row = mapRegistrantExportRow(SAMPLE_REGISTRATIONS[0]);
  assert.equal(row.registrationStatus, "CONFIRMED");
  assert.equal(row.ticketRef, "TCK-001");
  assert.equal(row.participantEmail, "samir@example.com");
});

test("buildRegistrantsExportRequest returns 401 for unauthenticated actor", () => {
  const response = buildRegistrantsExportRequest({
    registrations: SAMPLE_REGISTRATIONS,
    event: SAMPLE_EVENT,
    actor: {}
  });
  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 401);
});

test("buildRegistrantsExportRequest returns 403 for organizer outside scope", () => {
  const response = buildRegistrantsExportRequest({
    registrations: SAMPLE_REGISTRATIONS,
    event: SAMPLE_EVENT,
    actor: { role: "ORGANIZER", organizerId: "org-2" }
  });
  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 403);
});

test("buildRegistrantsExportRequest rejects unsupported format", () => {
  const response = buildRegistrantsExportRequest({
    registrations: SAMPLE_REGISTRATIONS,
    event: SAMPLE_EVENT,
    actor: { role: "ORGANIZER", organizerId: "org-1" },
    format: "xlsx"
  });
  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 400);
});

test("buildRegistrantsExportRequest returns scoped export payload and rows", () => {
  const response = buildRegistrantsExportRequest({
    registrations: SAMPLE_REGISTRATIONS,
    event: SAMPLE_EVENT,
    actor: { role: "ORGANIZER", organizerId: "org-1" },
    format: "csv",
    now: "2026-04-12T11:22:33.000Z",
    correlationId: "corr-1"
  });

  assert.equal(response.ok, true);
  assert.equal(response.statusCode, 202);
  assert.equal(response.data.status, "READY");
  assert.equal(response.data.format, "csv");
  assert.equal(response.data.rowCount, 2);
  assert.equal(response.data.rows.length, 2);
  assert.match(
    response.data.exportUrl,
    /\/api\/organizer\/events\/event-1\/registrations\/export\/exp_registrants_event-1_20260412112233\/download$/
  );
  assert.equal(response.data.rows[0].eventId, "event-1");
  assert.equal(response.audit.action, "REGISTRANTS_EXPORT_REQUESTED");
});

test("buildRegistrantsExportStatus returns READY payload for allowed organizer", () => {
  const response = buildRegistrantsExportStatus({
    exportId: "exp-1",
    eventId: "event-1",
    actor: { role: "ORGANIZER", organizerId: "org-1" },
    eventOwnerOrganizerId: "org-1",
    status: "READY",
    format: "csv",
    exportUrl: "/exports/exp-1.csv",
    expiresAt: "2026-04-12T12:22:33.000Z",
    correlationId: "corr-2"
  });

  assert.equal(response.ok, true);
  assert.equal(response.statusCode, 200);
  assert.equal(response.data.status, "READY");
  assert.equal(response.data.exportUrl, "/exports/exp-1.csv");
});
