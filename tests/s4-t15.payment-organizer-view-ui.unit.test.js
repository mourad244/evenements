import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOrganizerPaymentsViewModel,
  mapOrganizerPaymentRowToUi,
  normalizeOrganizerPaymentsFilters,
  normalizePaymentStatus,
  normalizeReconciliationStatus,
  sanitizeOrganizerPaymentRow
} from "../services/shared/paymentOrganizerViewUi.js";

const SAMPLE_ROW = {
  paymentTransactionId: "pay-1",
  eventId: "event-1",
  eventTitle: "Tech Forum",
  registrationId: "reg-1",
  participantEmail: "samir@example.com",
  status: "paid",
  reconciliationStatus: "resolved",
  amountGross: 120,
  amountRefunded: 20,
  amountNet: 100,
  currency: "eur",
  providerName: "ProviderX",
  providerReference: "prov-123456789",
  paidAt: "2026-03-10T08:00:00.000Z",
  updatedAt: "2026-03-10T08:05:00.000Z",
  rawProviderPayload: { secret: true },
  cardToken: "tok-secret"
};

test("normalize status helpers return canonical values", () => {
  assert.equal(normalizePaymentStatus("paid"), "PAID");
  assert.equal(normalizePaymentStatus("invalid"), "UNKNOWN");
  assert.equal(normalizeReconciliationStatus("needs_review"), "NEEDS_REVIEW");
  assert.equal(normalizeReconciliationStatus("invalid"), "UNKNOWN");
});

test("sanitizeOrganizerPaymentRow removes unauthorized fields and masks sensitive displays", () => {
  const sanitized = sanitizeOrganizerPaymentRow(SAMPLE_ROW);
  assert.equal(sanitized.status, "PAID");
  assert.equal(sanitized.reconciliationStatus, "RESOLVED");
  assert.match(sanitized.participantDisplay, /\*\*\*/);
  assert.match(sanitized.providerReferenceMasked, /\*\*\*/);
  assert.equal("rawProviderPayload" in sanitized, false);
  assert.equal("cardToken" in sanitized, false);
});

test("mapOrganizerPaymentRowToUi exposes labels and formatted amounts", () => {
  const uiRow = mapOrganizerPaymentRowToUi(SAMPLE_ROW, { locale: "en-US" });
  assert.equal(uiRow.statusLabel, "Paid");
  assert.equal(uiRow.statusTone, "success");
  assert.equal(uiRow.reconciliationLabel, "Resolved");
  assert.match(uiRow.amountGrossFormatted, /€|EUR/);
  assert.match(uiRow.amountNetFormatted, /€|EUR/);
});

test("normalizeOrganizerPaymentsFilters normalizes values and reports invalid ranges", () => {
  const normalized = normalizeOrganizerPaymentsFilters({
    status: ["paid", "refunded"],
    reconciliationStatus: ["needs_review"],
    dateFrom: "2026-03-01T00:00:00.000Z",
    dateTo: "2026-03-10T00:00:00.000Z",
    amountMin: "10",
    amountMax: "200",
    query: "  reg-1  ",
    sortBy: "amountNet",
    sortDir: "asc",
    page: "2",
    pageSize: "10"
  });

  assert.equal(normalized.isValid, true);
  assert.deepEqual(normalized.data.status, ["PAID", "REFUNDED"]);
  assert.deepEqual(normalized.data.reconciliationStatus, ["NEEDS_REVIEW"]);
  assert.equal(normalized.data.query, "reg-1");
  assert.equal(normalized.data.sortBy, "amountNet");
  assert.equal(normalized.data.sortDir, "asc");
  assert.equal(normalized.data.page, 2);
  assert.equal(normalized.data.pageSize, 10);
});

test("normalizeOrganizerPaymentsFilters flags invalid amount/date ranges", () => {
  const normalized = normalizeOrganizerPaymentsFilters({
    amountMin: "500",
    amountMax: "100",
    dateFrom: "2026-03-12T00:00:00.000Z",
    dateTo: "2026-03-10T00:00:00.000Z"
  });
  assert.equal(normalized.isValid, false);
  assert.ok(normalized.errors.includes("INVALID_AMOUNT_RANGE"));
  assert.ok(normalized.errors.includes("INVALID_DATE_RANGE"));
});

test("buildOrganizerPaymentsViewModel returns rows, summary, pagination and export CTA", () => {
  const viewModel = buildOrganizerPaymentsViewModel({
    items: [SAMPLE_ROW],
    summary: {
      totalGross: 120,
      totalRefunded: 20,
      totalNet: 100,
      currency: "EUR"
    },
    filters: {
      status: ["PAID"],
      sortBy: "paidAt",
      sortDir: "desc",
      page: 1,
      pageSize: 20
    },
    pagination: {
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1
    },
    exportState: {
      status: "READY",
      exportUrl: "https://exports/payments.csv"
    },
    locale: "en-US"
  });

  assert.equal(viewModel.rows.length, 1);
  assert.equal(viewModel.rows[0].paymentTransactionId, "pay-1");
  assert.equal(viewModel.pagination.totalItems, 1);
  assert.match(viewModel.summary.totalNetFormatted, /€|EUR/);
  assert.equal(viewModel.exportCta.action, "DOWNLOAD");
  assert.equal(viewModel.exportCta.exportUrl, "https://exports/payments.csv");
});
