import assert from "node:assert/strict";
import test from "node:test";

import {
  PRIORITY_METRIC_DEFINITIONS,
  createMetricsRegistry,
  createMonitoringMetricsEmitter
} from "../services/shared/monitoringMetricsEmission.js";

test("metrics registry records counter, gauge and histogram values", () => {
  const registry = createMetricsRegistry({
    metricDefinitions: {
      test_counter_total: {
        type: "counter",
        help: "Counter test",
        labelNames: ["service"]
      },
      test_gauge: {
        type: "gauge",
        help: "Gauge test",
        labelNames: ["service"]
      },
      test_histogram_ms: {
        type: "histogram",
        help: "Histogram test",
        labelNames: ["service"],
        buckets: [10, 50, 100]
      }
    }
  });

  registry.incrementCounter("test_counter_total", 2, { service: "svc-a" });
  registry.incrementCounter("test_counter_total", 3, { service: "svc-a" });
  registry.setGauge("test_gauge", 42, { service: "svc-a" });
  registry.observeHistogram("test_histogram_ms", 40, { service: "svc-a" });
  registry.observeHistogram("test_histogram_ms", 90, { service: "svc-a" });

  const snapshot = registry.getSnapshot();
  assert.equal(snapshot.counters.length, 1);
  assert.equal(snapshot.counters[0].value, 5);
  assert.equal(snapshot.gauges[0].value, 42);
  assert.equal(snapshot.histograms[0].count, 2);
  assert.equal(snapshot.histograms[0].sum, 130);
  assert.equal(snapshot.histograms[0].buckets["10"], 0);
  assert.equal(snapshot.histograms[0].buckets["50"], 1);
  assert.equal(snapshot.histograms[0].buckets["100"], 2);
});

test("metrics registry exports prometheus text format", () => {
  const registry = createMetricsRegistry({
    metricDefinitions: {
      test_counter_total: {
        type: "counter",
        help: "Counter test",
        labelNames: ["service"]
      }
    }
  });

  registry.incrementCounter("test_counter_total", 1, { service: "svc-a" });
  const text = registry.toPrometheusText();

  assert.match(text, /# HELP test_counter_total Counter test/);
  assert.match(text, /# TYPE test_counter_total counter/);
  assert.match(text, /test_counter_total\{service="svc-a"\} 1/);
});

test("priority metric definitions expose expected metric keys", () => {
  const keys = Object.keys(PRIORITY_METRIC_DEFINITIONS);
  assert.ok(keys.includes("notification_send_total"));
  assert.ok(keys.includes("ticket_generation_error_total"));
  assert.ok(keys.includes("registration_capacity_conflict_total"));
  assert.ok(keys.includes("payment_webhook_invalid_signature_total"));
  assert.ok(keys.includes("payment_reconciliation_cases_open"));
});

test("monitoring emitter records HTTP request metrics including 5xx", () => {
  const emitter = createMonitoringMetricsEmitter({
    serviceName: "api-gateway"
  });

  emitter.recordHttpRequest({
    route: "/api/events",
    method: "GET",
    statusCode: 503,
    durationMs: 150
  });

  const snapshot = emitter.registry.getSnapshot();
  const requestCounter = snapshot.counters.find(
    (series) => series.name === "gateway_http_requests_total"
  );
  const errorCounter = snapshot.counters.find(
    (series) => series.name === "gateway_http_5xx_total"
  );
  const durationHistogram = snapshot.histograms.find(
    (series) => series.name === "gateway_http_request_duration_ms"
  );

  assert.equal(requestCounter.value, 1);
  assert.equal(requestCounter.labels.statusClass, "5xx");
  assert.equal(errorCounter.value, 1);
  assert.equal(durationHistogram.count, 1);
});

test("monitoring emitter records notification and ticketing metrics", () => {
  const emitter = createMonitoringMetricsEmitter({
    serviceName: "notification-service"
  });

  emitter.recordNotificationSend({
    channel: "email",
    status: "FAILED",
    durationMs: 80,
    errorClass: "SMTP_TIMEOUT"
  });
  emitter.recordTicketGeneration({
    status: "FAILED",
    durationMs: 120,
    errorClass: "PDF_RENDER"
  });

  const snapshot = emitter.registry.getSnapshot();
  const notifTotal = snapshot.counters.find(
    (series) => series.name === "notification_send_total"
  );
  const notifFailed = snapshot.counters.find(
    (series) => series.name === "notification_send_failed_total"
  );
  const ticketTotal = snapshot.counters.find(
    (series) => series.name === "ticket_generation_total"
  );
  const ticketErrors = snapshot.counters.find(
    (series) => series.name === "ticket_generation_error_total"
  );

  assert.equal(notifTotal.value, 1);
  assert.equal(notifFailed.value, 1);
  assert.equal(notifFailed.labels.errorClass, "SMTP_TIMEOUT");
  assert.equal(ticketTotal.value, 1);
  assert.equal(ticketErrors.value, 1);
  assert.equal(ticketErrors.labels.errorClass, "PDF_RENDER");
});

test("monitoring emitter records registration conflict and reconciliation gauge", () => {
  const emitter = createMonitoringMetricsEmitter({
    serviceName: "registration-service"
  });

  emitter.recordRegistrationCapacityConflict({
    eventId: "event-123",
    count: 2
  });
  emitter.recordPaymentWebhookInvalidSignature({
    provider: "provider-x",
    count: 3
  });
  emitter.setPaymentReconciliationCasesOpen({
    category: "timeout",
    value: 9
  });

  const snapshot = emitter.registry.getSnapshot();
  const conflicts = snapshot.counters.find(
    (series) => series.name === "registration_capacity_conflict_total"
  );
  const invalidSignatures = snapshot.counters.find(
    (series) => series.name === "payment_webhook_invalid_signature_total"
  );
  const reconciliationGauge = snapshot.gauges.find(
    (series) => series.name === "payment_reconciliation_cases_open"
  );

  assert.equal(conflicts.value, 2);
  assert.equal(conflicts.labels.eventId, "event-123");
  assert.equal(invalidSignatures.value, 3);
  assert.equal(invalidSignatures.labels.provider, "provider-x");
  assert.equal(reconciliationGauge.value, 9);
  assert.equal(reconciliationGauge.labels.category, "timeout");
});

test("monitoring emitter exposes prometheus export text", () => {
  const emitter = createMonitoringMetricsEmitter({
    serviceName: "gateway"
  });

  emitter.recordHttpRequest({
    route: "/api/auth/login",
    method: "POST",
    statusCode: 200,
    durationMs: 18
  });
  const text = emitter.exportPrometheusMetrics();

  assert.match(text, /gateway_http_requests_total/);
  assert.match(text, /gateway_http_request_duration_ms_bucket/);
});
