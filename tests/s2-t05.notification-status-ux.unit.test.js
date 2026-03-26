import assert from "node:assert/strict";
import test from "node:test";

import {
  isSimulatedNotification,
  listNotificationStatusFilters,
  mapNotificationStatusToUx,
  normalizeNotificationStatus
} from "../services/shared/notificationStatusUx.js";

test("normalizeNotificationStatus uppercases and defaults to UNKNOWN", () => {
  assert.equal(normalizeNotificationStatus("sent"), "SENT");
  assert.equal(normalizeNotificationStatus(" "), "UNKNOWN");
});

test("mapNotificationStatusToUx returns config for known status", () => {
  const mapped = mapNotificationStatusToUx("SIMULATED");
  assert.equal(mapped.label, "SIMULATED");
  assert.match(mapped.description, /simulated/i);
});

test("mapNotificationStatusToUx returns UNKNOWN for unknown status", () => {
  const mapped = mapNotificationStatusToUx("custom");
  assert.equal(mapped.label, "UNKNOWN");
  assert.equal(mapped.filterable, false);
});

test("listNotificationStatusFilters exposes SIMULATED as a filter option", () => {
  const filters = listNotificationStatusFilters();
  const values = filters.map((entry) => entry.value);
  assert.ok(values.includes("SIMULATED"));
});

test("isSimulatedNotification detects simulated status", () => {
  assert.equal(isSimulatedNotification("SIMULATED"), true);
  assert.equal(isSimulatedNotification("sent"), false);
});
