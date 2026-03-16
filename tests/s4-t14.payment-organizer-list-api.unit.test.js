import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOrganizerPaymentsExportRequest,
  buildOrganizerPaymentsListResponse,
  canAccessOrganizerEvent,
  mapOrganizerPaymentRow,
  normalizeOrganizerPaymentsQuery
} from "../services/shared/paymentOrganizerListApi.js";

const SAMPLE_PAYMENTS = [
  {
    paymentTransactionId: "pay-1",
    eventId: "event-1",
    eventTitle: "Tech Forum",
    registrationId: "reg-1",
    participantEmail: "samir@example.com",
    status: "PAID",
    reconciliationStatus: "RESOLVED",
    amountGross: 120,
    amountRefunded: 0,
    amountNet: 120,
    currency: "eur",
    providerName: "ProviderX",
    providerReference: "prov-123456789",
    paidAt: "2026-03-10T08:00:00.000Z",
    updatedAt: "2026-03-10T08:05:00.000Z"
  },
  {
    paymentTransactionId: "pay-2",
    eventId: "event-1",
    eventTitle: "Tech Forum",
    registrationId: "reg-2",
    participantEmail: "ali@example.com",
    status: "REFUNDED",
    reconciliationStatus: "NEEDS_REVIEW",
    amountGross: 200,
    amountRefunded: 200,
    amountNet: 0,
    currency: "eur",
    providerName: "ProviderX",
    providerReference: "prov-987654321",
    paidAt: "2026-03-09T08:00:00.000Z",
    updatedAt: "2026-03-10T09:05:00.000Z"
  },
  {
    paymentTransactionId: "pay-3",
    eventId: "event-2",
    eventTitle: "Data Day",
    registrationId: "reg-3",
    participantEmail: "nora@example.com",
    status: "PAID",
    reconciliationStatus: "RESOLVED",
    amountGross: 300,
    amountRefunded: 0,
    amountNet: 300,
    currency: "eur",
    providerName: "ProviderX",
    providerReference: "prov-111111111",
    paidAt: "2026-03-08T08:00:00.000Z",
    updatedAt: "2026-03-08T08:05:00.000Z"
  }
];

test("normalizeOrganizerPaymentsQuery normalizes and defaults values", () => {
  const normalized = normalizeOrganizerPaymentsQuery({
    status: ["paid", "refunded"],
    reconciliationStatus: "needs_review",
    sortBy: "amountNet",
    sortDir: "asc",
    page: "2",
    pageSize: "10",
    amountMin: "5",
    amountMax: "200"
  });

  assert.equal(normalized.ok, true);
  assert.deepEqual(normalized.data.status, ["PAID", "REFUNDED"]);
  assert.deepEqual(normalized.data.reconciliationStatus, ["NEEDS_REVIEW"]);
  assert.equal(normalized.data.sortBy, "AMOUNTNET");
  assert.equal(normalized.data.sortDir, "ASC");
  assert.equal(normalized.data.page, 2);
  assert.equal(normalized.data.pageSize, 10);
  assert.equal(normalized.data.amountMin, 5);
  assert.equal(normalized.data.amountMax, 200);
});

test("normalizeOrganizerPaymentsQuery rejects invalid status filter", () => {
  const normalized = normalizeOrganizerPaymentsQuery({
    status: ["paid", "unknown"]
  });
  assert.equal(normalized.ok, false);
  assert.ok(normalized.errors.includes("INVALID_STATUS_FILTER"));
});

test("canAccessOrganizerEvent allows admin and event owner organizer only", () => {
  assert.equal(
    canAccessOrganizerEvent({
      actorRole: "ADMIN",
      actorOrganizerId: "org-2",
      eventOwnerOrganizerId: "org-1"
    }),
    true
  );
  assert.equal(
    canAccessOrganizerEvent({
      actorRole: "ORGANIZER",
      actorOrganizerId: "org-1",
      eventOwnerOrganizerId: "org-1"
    }),
    true
  );
  assert.equal(
    canAccessOrganizerEvent({
      actorRole: "ORGANIZER",
      actorOrganizerId: "org-2",
      eventOwnerOrganizerId: "org-1"
    }),
    false
  );
});

test("mapOrganizerPaymentRow masks participant and provider reference", () => {
  const row = mapOrganizerPaymentRow(SAMPLE_PAYMENTS[0]);
  assert.equal(row.status, "PAID");
  assert.equal(row.reconciliationStatus, "RESOLVED");
  assert.match(row.participantDisplay, /\*\*\*/);
  assert.match(row.providerReferenceMasked, /\*\*\*/);
  assert.equal(row.currency, "EUR");
});

test("buildOrganizerPaymentsListResponse returns 401 for unauthenticated actor", () => {
  const response = buildOrganizerPaymentsListResponse({
    payments: SAMPLE_PAYMENTS,
    eventId: "event-1",
    actor: {},
    eventOwnerOrganizerId: "org-1"
  });
  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 401);
});

test("buildOrganizerPaymentsListResponse returns 403 for organizer outside ownership scope", () => {
  const response = buildOrganizerPaymentsListResponse({
    payments: SAMPLE_PAYMENTS,
    eventId: "event-1",
    actor: { role: "ORGANIZER", organizerId: "org-2" },
    eventOwnerOrganizerId: "org-1"
  });
  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 403);
});

test("buildOrganizerPaymentsListResponse filters and paginates scoped event payments", () => {
  const response = buildOrganizerPaymentsListResponse({
    payments: SAMPLE_PAYMENTS,
    eventId: "event-1",
    actor: { role: "ORGANIZER", organizerId: "org-1" },
    eventOwnerOrganizerId: "org-1",
    query: {
      status: ["PAID", "REFUNDED"],
      sortBy: "amountNet",
      sortDir: "desc",
      page: 1,
      pageSize: 10
    },
    correlationId: "corr-1"
  });

  assert.equal(response.ok, true);
  assert.equal(response.statusCode, 200);
  assert.equal(response.data.items.length, 2);
  assert.equal(response.data.items[0].paymentTransactionId, "pay-1");
  assert.equal(response.data.pagination.totalItems, 2);
  assert.equal(response.data.summary.totalGross, 320);
  assert.equal(response.audit.action, "PAYMENT_ORGANIZER_VIEW_ACCESSED");
});

test("buildOrganizerPaymentsListResponse supports query search and excludes other events", () => {
  const response = buildOrganizerPaymentsListResponse({
    payments: SAMPLE_PAYMENTS,
    eventId: "event-1",
    actor: { role: "ORGANIZER", organizerId: "org-1" },
    eventOwnerOrganizerId: "org-1",
    query: {
      query: "reg-2"
    }
  });

  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.items[0].registrationId, "reg-2");
});

test("buildOrganizerPaymentsExportRequest returns 202 for allowed organizer", () => {
  const response = buildOrganizerPaymentsExportRequest({
    eventId: "event-1",
    actor: { role: "ORGANIZER", organizerId: "org-1" },
    eventOwnerOrganizerId: "org-1",
    filters: { status: ["PAID"] },
    format: "csv",
    now: "2026-03-11T10:20:30.000Z"
  });

  assert.equal(response.ok, true);
  assert.equal(response.statusCode, 202);
  assert.equal(response.data.status, "RUNNING");
  assert.match(response.data.exportId, /^exp_event-1_20260311102030$/);
  assert.equal(response.audit.action, "PAYMENT_ORGANIZER_EXPORT_REQUESTED");
});

test("buildOrganizerPaymentsExportRequest rejects unsupported format and forbidden scope", () => {
  const forbidden = buildOrganizerPaymentsExportRequest({
    eventId: "event-1",
    actor: { role: "ORGANIZER", organizerId: "org-2" },
    eventOwnerOrganizerId: "org-1",
    format: "csv"
  });
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.statusCode, 403);

  const badFormat = buildOrganizerPaymentsExportRequest({
    eventId: "event-1",
    actor: { role: "ORGANIZER", organizerId: "org-1" },
    eventOwnerOrganizerId: "org-1",
    format: "xlsx"
  });
  assert.equal(badFormat.ok, false);
  assert.equal(badFormat.statusCode, 400);
});
