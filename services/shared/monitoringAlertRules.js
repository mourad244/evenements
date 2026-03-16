export const DEFAULT_MONITORING_ALERT_RULES = [
  {
    ruleId: "ALERT_INC_N01",
    incidentId: "INC-N01",
    metric: "notification_send_fail_rate_5m",
    operator: "GT",
    threshold: 5,
    windowMinutes: 10,
    severity: "P1",
    channels: ["slack:#ops-alerts", "email:oncall@ops.local"],
    runbookId: "RB-N01",
    title: "Notification failures spike"
  },
  {
    ruleId: "ALERT_INC_T01",
    incidentId: "INC-T01",
    metric: "ticket_generation_error_rate_5m",
    operator: "GT",
    threshold: 3,
    windowMinutes: 10,
    severity: "P1",
    channels: ["slack:#ops-alerts", "pager:ops"],
    runbookId: "RB-T01",
    title: "Ticket generation failures spike"
  },
  {
    ruleId: "ALERT_INC_R01",
    incidentId: "INC-R01",
    metric: "registration_capacity_conflict_total",
    operator: "GTE",
    threshold: 1,
    windowMinutes: 5,
    severity: "P1",
    channels: ["slack:#ops-alerts", "pager:ops"],
    runbookId: "RB-R01",
    title: "Registration capacity conflict detected"
  },
  {
    ruleId: "ALERT_INC_P01",
    incidentId: "INC-P01",
    metric: "payment_webhook_invalid_signature_total",
    operator: "GT",
    threshold: 20,
    windowMinutes: 15,
    severity: "P2",
    channels: ["slack:#ops-alerts"],
    runbookId: "RB-P01",
    title: "Invalid payment webhook signatures spike"
  },
  {
    ruleId: "ALERT_INC_P02",
    incidentId: "INC-P02",
    metric: "payment_reconciliation_cases_open_total",
    operator: "GT",
    threshold: 30,
    windowMinutes: 30,
    severity: "P2",
    channels: ["slack:#ops-alerts"],
    runbookId: "RB-P02",
    title: "Payment reconciliation backlog growing"
  },
  {
    ruleId: "ALERT_INC_G01",
    incidentId: "INC-G01",
    metric: "gateway_http_5xx_rate_5m",
    operator: "GT",
    threshold: 2,
    windowMinutes: 10,
    severity: "P1",
    channels: ["slack:#ops-alerts", "pager:ops"],
    runbookId: "RB-G01",
    title: "Gateway 5xx rate degraded"
  }
];

export function buildAlertObservationsFromSnapshot(snapshot = {}) {
  const notificationTotal = sumSeriesValue(
    snapshot.counters,
    "notification_send_total"
  );
  const notificationFailed = sumSeriesValue(
    snapshot.counters,
    "notification_send_failed_total"
  );
  const ticketTotal = sumSeriesValue(snapshot.counters, "ticket_generation_total");
  const ticketErrors = sumSeriesValue(
    snapshot.counters,
    "ticket_generation_error_total"
  );
  const gatewayRequestTotal = sumSeriesValue(
    snapshot.counters,
    "gateway_http_requests_total"
  );
  const gateway5xxTotal = sumSeriesValue(snapshot.counters, "gateway_http_5xx_total");

  return {
    notification_send_fail_rate_5m: ratioPercent(
      notificationFailed,
      notificationTotal
    ),
    ticket_generation_error_rate_5m: ratioPercent(ticketErrors, ticketTotal),
    registration_capacity_conflict_total: sumSeriesValue(
      snapshot.counters,
      "registration_capacity_conflict_total"
    ),
    payment_webhook_invalid_signature_total: sumSeriesValue(
      snapshot.counters,
      "payment_webhook_invalid_signature_total"
    ),
    payment_reconciliation_cases_open_total: sumSeriesValue(
      snapshot.gauges,
      "payment_reconciliation_cases_open"
    ),
    gateway_http_5xx_rate_5m: ratioPercent(gateway5xxTotal, gatewayRequestTotal)
  };
}

export function evaluateAlertRules({
  observations = {},
  rules = DEFAULT_MONITORING_ALERT_RULES,
  now = new Date().toISOString()
} = {}) {
  const triggeredAlerts = [];
  const evaluatedRules = [];

  for (const rawRule of rules || []) {
    const rule = normalizeRule(rawRule);
    const observedValue = normalizeNumber(observations[rule.metric], null);

    if (observedValue === null) {
      evaluatedRules.push({
        ruleId: rule.ruleId,
        incidentId: rule.incidentId,
        metric: rule.metric,
        status: "NO_DATA",
        reason: "METRIC_NOT_AVAILABLE"
      });
      continue;
    }

    const shouldTrigger = compareValue(
      observedValue,
      rule.operator,
      rule.threshold
    );
    if (shouldTrigger) {
      const alert = {
        ruleId: rule.ruleId,
        incidentId: rule.incidentId,
        runbookId: rule.runbookId,
        metric: rule.metric,
        observedValue: Number(observedValue.toFixed(3)),
        threshold: rule.threshold,
        operator: rule.operator,
        severity: rule.severity,
        windowMinutes: rule.windowMinutes,
        channels: rule.channels,
        title: rule.title,
        message: buildAlertMessage(rule, observedValue),
        triggeredAt: now
      };
      triggeredAlerts.push(alert);
      evaluatedRules.push({
        ruleId: rule.ruleId,
        incidentId: rule.incidentId,
        metric: rule.metric,
        status: "TRIGGERED",
        observedValue: alert.observedValue
      });
      continue;
    }

    evaluatedRules.push({
      ruleId: rule.ruleId,
      incidentId: rule.incidentId,
      metric: rule.metric,
      status: "OK",
      observedValue: Number(observedValue.toFixed(3))
    });
  }

  return {
    evaluatedAt: now,
    triggeredAlerts,
    evaluatedRules
  };
}

export function evaluateAlertsFromMetricsSnapshot({
  snapshot = {},
  rules = DEFAULT_MONITORING_ALERT_RULES,
  now = new Date().toISOString()
} = {}) {
  const observations = buildAlertObservationsFromSnapshot(snapshot);
  const evaluation = evaluateAlertRules({
    observations,
    rules,
    now
  });
  return {
    observations,
    ...evaluation
  };
}

export function buildAlertDispatchPayloads({
  alerts = [],
  correlationId = null
} = {}) {
  const payloads = [];
  for (const alert of alerts || []) {
    for (const channel of alert.channels || []) {
      payloads.push({
        channel,
        severity: alert.severity,
        incidentId: alert.incidentId,
        runbookId: alert.runbookId,
        message: alert.message,
        correlationId: normalizeOptionalString(correlationId),
        metadata: {
          ruleId: alert.ruleId,
          metric: alert.metric,
          observedValue: alert.observedValue,
          threshold: alert.threshold,
          operator: alert.operator
        },
        audit: {
          action: "MONITORING_ALERT_TRIGGERED",
          incidentId: alert.incidentId,
          runbookId: alert.runbookId,
          severity: alert.severity
        }
      });
    }
  }
  return payloads;
}

function normalizeRule(rawRule = {}) {
  return {
    ruleId: normalizeOptionalString(rawRule.ruleId) || "UNKNOWN_RULE",
    incidentId: normalizeOptionalString(rawRule.incidentId) || "UNKNOWN_INCIDENT",
    metric: normalizeOptionalString(rawRule.metric) || "unknown_metric",
    operator: normalizeOperator(rawRule.operator),
    threshold: normalizeNumber(rawRule.threshold, 0),
    windowMinutes: normalizePositiveInt(rawRule.windowMinutes, 5),
    severity: normalizeSeverity(rawRule.severity),
    channels: normalizeChannels(rawRule.channels),
    runbookId: normalizeOptionalString(rawRule.runbookId) || "UNKNOWN_RUNBOOK",
    title: normalizeOptionalString(rawRule.title) || "Monitoring alert"
  };
}

function normalizeSeverity(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "P1" || normalized === "P2" || normalized === "P3") {
    return normalized;
  }
  return "P2";
}

function normalizeOperator(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "GT" || normalized === "GTE" || normalized === "LT" || normalized === "LTE" || normalized === "EQ") {
    return normalized;
  }
  return "GT";
}

function normalizeChannels(value) {
  const channels = Array.isArray(value) ? value : value ? [value] : [];
  return channels
    .map((channel) => normalizeOptionalString(channel))
    .filter(Boolean);
}

function compareValue(observedValue, operator, threshold) {
  if (operator === "GT") return observedValue > threshold;
  if (operator === "GTE") return observedValue >= threshold;
  if (operator === "LT") return observedValue < threshold;
  if (operator === "LTE") return observedValue <= threshold;
  return observedValue === threshold;
}

function buildAlertMessage(rule, observedValue) {
  return `${rule.title}: ${rule.metric}=${Number(observedValue.toFixed(3))} ${operatorSymbol(
    rule.operator
  )} ${rule.threshold} (window=${rule.windowMinutes}m, runbook=${rule.runbookId})`;
}

function operatorSymbol(operator) {
  if (operator === "GT") return ">";
  if (operator === "GTE") return ">=";
  if (operator === "LT") return "<";
  if (operator === "LTE") return "<=";
  return "==";
}

function sumSeriesValue(seriesCollection, metricName) {
  if (!Array.isArray(seriesCollection)) {
    return 0;
  }
  return seriesCollection
    .filter((series) => series?.name === metricName)
    .reduce((sum, series) => sum + normalizeNumber(series.value, 0), 0);
}

function ratioPercent(numerator, denominator) {
  const safeNumerator = normalizeNumber(numerator, 0);
  const safeDenominator = normalizeNumber(denominator, 0);
  if (safeDenominator <= 0) {
    return 0;
  }
  return Number(((safeNumerator / safeDenominator) * 100).toFixed(3));
}

function normalizeNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizePositiveInt(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
