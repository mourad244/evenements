import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAlertDispatchPayloads,
  buildAlertObservationsFromSnapshot,
  DEFAULT_MONITORING_ALERT_RULES,
  evaluateAlertsFromMetricsSnapshot,
  evaluateAlertRules
} from "../services/shared/monitoringAlertRules.js";
import {
  PRIORITY_METRIC_DEFINITIONS,
  createMetricsRegistry
} from "../services/shared/monitoringMetricsEmission.js";

test("default alert rules cover critical incidents from matrix", () => {
  const incidentIds = DEFAULT_MONITORING_ALERT_RULES.map((rule) => rule.incidentId);
  const runbookIds = DEFAULT_MONITORING_ALERT_RULES.map((rule) => rule.runbookId);

  assert.deepEqual(incidentIds, [
    "INC-N01",
    "INC-T01",
    "INC-R01",
    "INC-P01",
    "INC-P02",
    "INC-G01"
  ]);
  assert.deepEqual(runbookIds, [
    "RB-N01",
    "RB-T01",
    "RB-R01",
    "RB-P01",
    "RB-P02",
    "RB-G01"
  ]);
});

test("buildAlertObservationsFromSnapshot derives rates and totals", () => {
  const registry = createMetricsRegistry({
    metricDefinitions: PRIORITY_METRIC_DEFINITIONS
  });

  registry.incrementCounter("notification_send_total", 100, {
    service: "notification-service",
    channel: "email",
    status: "SENT"
  });
  registry.incrementCounter("notification_send_failed_total", 10, {
    service: "notification-service",
    channel: "email",
    errorClass: "SMTP_TIMEOUT"
  });

  registry.incrementCounter("ticket_generation_total", 100, {
    service: "ticketing-service",
    status: "SUCCESS"
  });
  registry.incrementCounter("ticket_generation_error_total", 4, {
    service: "ticketing-service",
    errorClass: "PDF_RENDER"
  });

  registry.incrementCounter("gateway_http_requests_total", 100, {
    service: "gateway",
    route: "/api/events",
    method: "GET",
    statusClass: "2xx"
  });
  registry.incrementCounter("gateway_http_5xx_total", 3, {
    service: "gateway",
    route: "/api/events",
    method: "GET"
  });

  registry.incrementCounter("registration_capacity_conflict_total", 2, {
    service: "registration-service",
    eventId: "event-1"
  });
  registry.incrementCounter("payment_webhook_invalid_signature_total", 22, {
    service: "payment-service",
    provider: "provider-x"
  });
  registry.setGauge("payment_reconciliation_cases_open", 40, {
    service: "payment-service",
    category: "timeout"
  });

  const observations = buildAlertObservationsFromSnapshot(registry.getSnapshot());
  assert.equal(observations.notification_send_fail_rate_5m, 10);
  assert.equal(observations.ticket_generation_error_rate_5m, 4);
  assert.equal(observations.gateway_http_5xx_rate_5m, 3);
  assert.equal(observations.registration_capacity_conflict_total, 2);
  assert.equal(observations.payment_webhook_invalid_signature_total, 22);
  assert.equal(observations.payment_reconciliation_cases_open_total, 40);
});

test("evaluateAlertRules triggers matching rules and marks healthy ones", () => {
  const evaluation = evaluateAlertRules({
    observations: {
      notification_send_fail_rate_5m: 8,
      ticket_generation_error_rate_5m: 4,
      registration_capacity_conflict_total: 1,
      payment_webhook_invalid_signature_total: 25,
      payment_reconciliation_cases_open_total: 10,
      gateway_http_5xx_rate_5m: 1
    },
    now: "2026-03-11T12:00:00.000Z"
  });

  const triggeredIds = evaluation.triggeredAlerts.map((alert) => alert.incidentId);
  assert.deepEqual(triggeredIds, ["INC-N01", "INC-T01", "INC-R01", "INC-P01"]);

  const p02Rule = evaluation.evaluatedRules.find(
    (item) => item.incidentId === "INC-P02"
  );
  const g01Rule = evaluation.evaluatedRules.find(
    (item) => item.incidentId === "INC-G01"
  );
  assert.equal(p02Rule.status, "OK");
  assert.equal(g01Rule.status, "OK");
});

test("evaluateAlertsFromMetricsSnapshot builds alerts end-to-end", () => {
  const registry = createMetricsRegistry({
    metricDefinitions: PRIORITY_METRIC_DEFINITIONS
  });

  registry.incrementCounter("notification_send_total", 50, {
    service: "notification-service",
    channel: "email",
    status: "SENT"
  });
  registry.incrementCounter("notification_send_failed_total", 5, {
    service: "notification-service",
    channel: "email",
    errorClass: "SMTP_TIMEOUT"
  });
  registry.incrementCounter("gateway_http_requests_total", 100, {
    service: "gateway",
    route: "/api/payments",
    method: "POST",
    statusClass: "5xx"
  });
  registry.incrementCounter("gateway_http_5xx_total", 5, {
    service: "gateway",
    route: "/api/payments",
    method: "POST"
  });

  const evaluation = evaluateAlertsFromMetricsSnapshot({
    snapshot: registry.getSnapshot(),
    now: "2026-03-11T12:10:00.000Z"
  });

  const incidentIds = evaluation.triggeredAlerts.map((alert) => alert.incidentId);
  assert.ok(incidentIds.includes("INC-N01"));
  assert.ok(incidentIds.includes("INC-G01"));
  assert.equal(evaluation.evaluatedAt, "2026-03-11T12:10:00.000Z");
});

test("buildAlertDispatchPayloads creates dispatches and audit metadata per channel", () => {
  const evaluation = evaluateAlertRules({
    observations: {
      notification_send_fail_rate_5m: 9
    },
    rules: [DEFAULT_MONITORING_ALERT_RULES[0]],
    now: "2026-03-11T12:20:00.000Z"
  });

  const payloads = buildAlertDispatchPayloads({
    alerts: evaluation.triggeredAlerts,
    correlationId: "corr-ops-1"
  });

  assert.equal(payloads.length, 2);
  assert.equal(payloads[0].incidentId, "INC-N01");
  assert.equal(payloads[0].audit.action, "MONITORING_ALERT_TRIGGERED");
  assert.equal(payloads[0].correlationId, "corr-ops-1");
  assert.match(payloads[0].message, /notification_send_fail_rate_5m/i);
});

test("evaluateAlertRules marks no-data metrics as NO_DATA", () => {
  const evaluation = evaluateAlertRules({
    observations: {}
  });

  assert.equal(evaluation.triggeredAlerts.length, 0);
  assert.ok(evaluation.evaluatedRules.every((rule) => rule.status === "NO_DATA"));
});
