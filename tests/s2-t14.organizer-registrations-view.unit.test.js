import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOrganizerRegistrationsViewModel,
  mergeOrganizerExportState
} from "../services/shared/organizerRegistrationsView.js";

test("buildOrganizerRegistrationsViewModel maps registrants and export CTA", () => {
  const viewModel = buildOrganizerRegistrationsViewModel({
    registrations: [
      {
        registrationId: "reg-1",
        participantName: "Sam",
        status: "confirmed",
        ticketRef: "TCK-1"
      },
      {
        registrationId: "reg-2",
        participantName: "Nora",
        status: "waitlisted",
        ticketRef: null
      }
    ],
    exportState: {
      status: "READY",
      exportUrl: "/exports/event-1.csv"
    },
    correlationId: "corr-1"
  });

  assert.equal(viewModel.rows.length, 2);
  assert.equal(viewModel.rows[0].status, "CONFIRMED");
  assert.equal(viewModel.rows[1].status, "WAITLISTED");
  assert.equal(viewModel.exportCta.action, "DOWNLOAD");
  assert.equal(viewModel.exportCta.exportUrl, "/exports/event-1.csv");
  assert.equal(viewModel.correlationId, "corr-1");
});

test("buildOrganizerRegistrationsViewModel maps running export state to wait CTA", () => {
  const viewModel = buildOrganizerRegistrationsViewModel({
    registrations: [],
    exportState: {
      status: "RUNNING"
    }
  });

  assert.equal(viewModel.exportCta.action, "WAIT");
});

test("mergeOrganizerExportState prefers latest status payload over request payload", () => {
  const merged = mergeOrganizerExportState({
    requestResponse: {
      ok: true,
      data: {
        exportId: "exp-1",
        status: "RUNNING",
        exportUrl: null,
        format: "csv"
      }
    },
    statusResponse: {
      ok: true,
      data: {
        exportId: "exp-1",
        status: "READY",
        exportUrl: "/exports/exp-1.csv",
        format: "csv",
        expiresAt: "2026-04-12T12:00:00.000Z"
      }
    }
  });

  assert.equal(merged.exportId, "exp-1");
  assert.equal(merged.status, "READY");
  assert.equal(merged.exportUrl, "/exports/exp-1.csv");
  assert.equal(merged.expiresAt, "2026-04-12T12:00:00.000Z");
});

test("mergeOrganizerExportState falls back to request payload when no status payload exists", () => {
  const merged = mergeOrganizerExportState({
    requestResponse: {
      ok: true,
      data: {
        exportId: "exp-2",
        status: "RUNNING",
        exportUrl: null,
        format: "csv"
      }
    }
  });

  assert.equal(merged.exportId, "exp-2");
  assert.equal(merged.status, "RUNNING");
  assert.equal(merged.format, "csv");
});
