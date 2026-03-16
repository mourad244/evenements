import assert from "node:assert/strict";
import test from "node:test";

import {
  mapOrganizerRegistrantRow,
  normalizeExportStatus,
  resolveExportCta
} from "../services/shared/organizerExportUi.js";

test("normalizeExportStatus uppercases and defaults to UNKNOWN", () => {
  assert.equal(normalizeExportStatus("ready"), "READY");
  assert.equal(normalizeExportStatus(" "), "UNKNOWN");
});

test("resolveExportCta returns download action for READY", () => {
  const cta = resolveExportCta({
    status: "READY",
    exportUrl: "https://exports/registrants.csv"
  });
  assert.equal(cta.action, "DOWNLOAD");
  assert.equal(cta.exportUrl, "https://exports/registrants.csv");
});

test("resolveExportCta returns wait action for RUNNING", () => {
  const cta = resolveExportCta({
    status: "RUNNING"
  });
  assert.equal(cta.action, "WAIT");
});

test("resolveExportCta returns retry for FAILED", () => {
  const cta = resolveExportCta({
    status: "FAILED"
  });
  assert.equal(cta.action, "RETRY");
});

test("mapOrganizerRegistrantRow normalizes fields", () => {
  const row = mapOrganizerRegistrantRow({
    registrationId: "reg-1",
    participantName: "Sam",
    status: "confirmed",
    ticketRef: "T-100"
  });
  assert.equal(row.status, "CONFIRMED");
  assert.equal(row.ticketRef, "T-100");
});
