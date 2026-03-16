const DEFAULT_HISTOGRAM_BUCKETS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

export const PRIORITY_METRIC_DEFINITIONS = {
  gateway_http_requests_total: {
    type: "counter",
    help: "Total HTTP requests observed by service and status class.",
    labelNames: ["service", "route", "method", "statusClass"]
  },
  gateway_http_5xx_total: {
    type: "counter",
    help: "Total HTTP 5xx responses observed by service and route.",
    labelNames: ["service", "route", "method"]
  },
  gateway_http_request_duration_ms: {
    type: "histogram",
    help: "Distribution of HTTP request duration in milliseconds.",
    labelNames: ["service", "route", "method"],
    buckets: [25, 50, 100, 250, 500, 1000, 2500]
  },
  notification_send_total: {
    type: "counter",
    help: "Total notification send attempts by channel and status.",
    labelNames: ["service", "channel", "status"]
  },
  notification_send_failed_total: {
    type: "counter",
    help: "Total notification send failures by channel and error class.",
    labelNames: ["service", "channel", "errorClass"]
  },
  notification_send_duration_ms: {
    type: "histogram",
    help: "Distribution of notification send duration in milliseconds.",
    labelNames: ["service", "channel"],
    buckets: [10, 25, 50, 100, 200, 500, 1000]
  },
  ticket_generation_total: {
    type: "counter",
    help: "Total ticket generation attempts by status.",
    labelNames: ["service", "status"]
  },
  ticket_generation_error_total: {
    type: "counter",
    help: "Total ticket generation errors by error class.",
    labelNames: ["service", "errorClass"]
  },
  ticket_generation_duration_ms: {
    type: "histogram",
    help: "Distribution of ticket generation duration in milliseconds.",
    labelNames: ["service"],
    buckets: [25, 50, 100, 250, 500, 1000, 2500]
  },
  registration_capacity_conflict_total: {
    type: "counter",
    help: "Total registration capacity conflicts.",
    labelNames: ["service", "eventId"]
  },
  payment_webhook_invalid_signature_total: {
    type: "counter",
    help: "Total invalid payment webhook signatures by provider.",
    labelNames: ["service", "provider"]
  },
  payment_reconciliation_cases_open: {
    type: "gauge",
    help: "Open payment reconciliation cases by category.",
    labelNames: ["service", "category"]
  }
};

export function createMetricsRegistry({
  metricDefinitions = {},
  nowFn = () => new Date().toISOString()
} = {}) {
  const definitions = normalizeDefinitions(metricDefinitions);
  const storage = new Map();

  return {
    incrementCounter(name, value = 1, labels = {}) {
      const definition = getDefinition(definitions, name, "counter");
      const normalizedLabels = normalizeLabels(definition.labelNames, labels);
      const key = buildSeriesKey(name, normalizedLabels);
      const state = storage.get(key) || {
        kind: "counter",
        name,
        labels: normalizedLabels,
        value: 0,
        updatedAt: nowFn()
      };

      state.value += normalizeNonNegativeNumber(value, 1);
      state.updatedAt = nowFn();
      storage.set(key, state);
      return state.value;
    },

    setGauge(name, value, labels = {}) {
      const definition = getDefinition(definitions, name, "gauge");
      const normalizedLabels = normalizeLabels(definition.labelNames, labels);
      const key = buildSeriesKey(name, normalizedLabels);
      const state = {
        kind: "gauge",
        name,
        labels: normalizedLabels,
        value: normalizeNumber(value, 0),
        updatedAt: nowFn()
      };
      storage.set(key, state);
      return state.value;
    },

    observeHistogram(name, value, labels = {}) {
      const definition = getDefinition(definitions, name, "histogram");
      const normalizedValue = normalizeNonNegativeNumber(value, 0);
      const normalizedLabels = normalizeLabels(definition.labelNames, labels);
      const key = buildSeriesKey(name, normalizedLabels);
      const buckets = definition.buckets || DEFAULT_HISTOGRAM_BUCKETS;
      const state = storage.get(key) || {
        kind: "histogram",
        name,
        labels: normalizedLabels,
        buckets: initializeBuckets(buckets),
        count: 0,
        sum: 0,
        updatedAt: nowFn()
      };

      for (const bound of buckets) {
        if (normalizedValue <= bound) {
          state.buckets[String(bound)] += 1;
        }
      }
      state.count += 1;
      state.sum += normalizedValue;
      state.updatedAt = nowFn();
      storage.set(key, state);
      return {
        count: state.count,
        sum: state.sum
      };
    },

    getSnapshot() {
      const counters = [];
      const gauges = [];
      const histograms = [];

      for (const series of storage.values()) {
        if (series.kind === "counter") counters.push(structuredCloneSeries(series));
        else if (series.kind === "gauge") gauges.push(structuredCloneSeries(series));
        else if (series.kind === "histogram") {
          histograms.push(structuredCloneSeries(series));
        }
      }

      return {
        counters,
        gauges,
        histograms
      };
    },

    toPrometheusText() {
      const lines = [];
      for (const [name, definition] of Object.entries(definitions)) {
        lines.push(`# HELP ${name} ${definition.help}`);
        lines.push(`# TYPE ${name} ${definition.type}`);

        const seriesForMetric = [...storage.values()].filter(
          (series) => series.name === name
        );

        for (const series of seriesForMetric) {
          if (series.kind === "histogram") {
            lines.push(
              ...serializeHistogramSeries(name, series, definition.labelNames)
            );
          } else {
            lines.push(
              `${name}${serializeLabelSet(series.labels, definition.labelNames)} ${series.value}`
            );
          }
        }
      }
      return `${lines.join("\n")}\n`;
    }
  };
}

export function createMonitoringMetricsEmitter({
  serviceName,
  registry = createMetricsRegistry({
    metricDefinitions: PRIORITY_METRIC_DEFINITIONS
  })
} = {}) {
  const normalizedService = normalizeLabelValue(serviceName, "unknown_service");

  return {
    registry,

    recordHttpRequest({
      route,
      method,
      statusCode,
      durationMs = 0
    } = {}) {
      const normalizedRoute = normalizeLabelValue(route, "unknown_route");
      const normalizedMethod = normalizeLabelValue(
        String(method || "").toUpperCase(),
        "GET"
      );
      const normalizedStatusCode = normalizeHttpStatusCode(statusCode);
      const statusClass = `${Math.floor(normalizedStatusCode / 100)}xx`;

      registry.incrementCounter("gateway_http_requests_total", 1, {
        service: normalizedService,
        route: normalizedRoute,
        method: normalizedMethod,
        statusClass
      });

      if (normalizedStatusCode >= 500) {
        registry.incrementCounter("gateway_http_5xx_total", 1, {
          service: normalizedService,
          route: normalizedRoute,
          method: normalizedMethod
        });
      }

      registry.observeHistogram("gateway_http_request_duration_ms", durationMs, {
        service: normalizedService,
        route: normalizedRoute,
        method: normalizedMethod
      });
    },

    recordNotificationSend({
      channel = "email",
      status = "SENT",
      durationMs = 0,
      errorClass = null
    } = {}) {
      const normalizedChannel = normalizeLabelValue(channel, "email");
      const normalizedStatus = normalizeLabelValue(
        String(status || "").toUpperCase(),
        "UNKNOWN"
      );

      registry.incrementCounter("notification_send_total", 1, {
        service: normalizedService,
        channel: normalizedChannel,
        status: normalizedStatus
      });

      if (normalizedStatus !== "SENT" && normalizedStatus !== "SUCCESS") {
        registry.incrementCounter("notification_send_failed_total", 1, {
          service: normalizedService,
          channel: normalizedChannel,
          errorClass: normalizeLabelValue(errorClass, normalizedStatus)
        });
      }

      registry.observeHistogram("notification_send_duration_ms", durationMs, {
        service: normalizedService,
        channel: normalizedChannel
      });
    },

    recordTicketGeneration({
      status = "SUCCESS",
      durationMs = 0,
      errorClass = null
    } = {}) {
      const normalizedStatus = normalizeLabelValue(
        String(status || "").toUpperCase(),
        "UNKNOWN"
      );

      registry.incrementCounter("ticket_generation_total", 1, {
        service: normalizedService,
        status: normalizedStatus
      });
      registry.observeHistogram("ticket_generation_duration_ms", durationMs, {
        service: normalizedService
      });

      if (normalizedStatus !== "SUCCESS" && normalizedStatus !== "GENERATED") {
        registry.incrementCounter("ticket_generation_error_total", 1, {
          service: normalizedService,
          errorClass: normalizeLabelValue(errorClass, normalizedStatus)
        });
      }
    },

    recordRegistrationCapacityConflict({
      eventId = "unknown_event",
      count = 1
    } = {}) {
      registry.incrementCounter(
        "registration_capacity_conflict_total",
        count,
        {
          service: normalizedService,
          eventId: normalizeLabelValue(eventId, "unknown_event")
        }
      );
    },

    recordPaymentWebhookInvalidSignature({
      provider = "unknown_provider",
      count = 1
    } = {}) {
      registry.incrementCounter(
        "payment_webhook_invalid_signature_total",
        count,
        {
          service: normalizedService,
          provider: normalizeLabelValue(provider, "unknown_provider")
        }
      );
    },

    setPaymentReconciliationCasesOpen({
      category = "all",
      value = 0
    } = {}) {
      registry.setGauge("payment_reconciliation_cases_open", value, {
        service: normalizedService,
        category: normalizeLabelValue(category, "all")
      });
    },

    exportPrometheusMetrics() {
      return registry.toPrometheusText();
    }
  };
}

function normalizeDefinitions(definitions) {
  const normalized = {};
  for (const [name, definition] of Object.entries(definitions || {})) {
    const metricName = normalizeMetricName(name);
    normalized[metricName] = {
      type: normalizeMetricType(definition.type),
      help: String(definition.help || metricName),
      labelNames: normalizeLabelNames(definition.labelNames),
      buckets: normalizeBuckets(definition.buckets)
    };
  }
  return normalized;
}

function normalizeMetricName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_:]/g, "_");
}

function normalizeMetricType(type) {
  const normalized = String(type || "").trim().toLowerCase();
  if (normalized === "counter" || normalized === "gauge" || normalized === "histogram") {
    return normalized;
  }
  throw new Error(`Unsupported metric type: ${type}`);
}

function normalizeLabelNames(labelNames) {
  const names = Array.isArray(labelNames) ? labelNames : [];
  return names.map((name) =>
    String(name || "")
      .trim()
      .replace(/[^a-zA-Z0-9_]/g, "")
  );
}

function normalizeBuckets(buckets) {
  if (!Array.isArray(buckets) || buckets.length === 0) {
    return DEFAULT_HISTOGRAM_BUCKETS;
  }
  const normalized = buckets
    .map((value) => normalizeNonNegativeNumber(value, null))
    .filter((value) => value !== null);

  if (normalized.length === 0) {
    return DEFAULT_HISTOGRAM_BUCKETS;
  }
  return [...new Set(normalized)].sort((left, right) => left - right);
}

function getDefinition(definitions, name, expectedType) {
  const metricName = normalizeMetricName(name);
  const definition = definitions[metricName];
  if (!definition) {
    throw new Error(`Unknown metric: ${metricName}`);
  }
  if (definition.type !== expectedType) {
    throw new Error(
      `Invalid metric type for ${metricName}: expected ${expectedType}, got ${definition.type}`
    );
  }
  return definition;
}

function buildSeriesKey(metricName, labels) {
  const labelKey = Object.entries(labels)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}=${value}`)
    .join("|");
  return `${metricName}|${labelKey}`;
}

function normalizeLabels(labelNames, sourceLabels) {
  const normalized = {};
  for (const labelName of labelNames) {
    normalized[labelName] = normalizeLabelValue(sourceLabels?.[labelName], "unknown");
  }
  return normalized;
}

function normalizeLabelValue(value, fallback) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeNonNegativeNumber(value, fallback) {
  const numeric = normalizeNumber(value, fallback);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }
  return numeric;
}

function normalizeHttpStatusCode(value) {
  const code = Number.parseInt(value, 10);
  if (!Number.isFinite(code) || code < 100 || code > 599) {
    return 500;
  }
  return code;
}

function initializeBuckets(bounds) {
  const result = {};
  for (const bound of bounds) {
    result[String(bound)] = 0;
  }
  return result;
}

function structuredCloneSeries(series) {
  return {
    ...series,
    labels: { ...series.labels },
    buckets: series.buckets ? { ...series.buckets } : undefined
  };
}

function serializeLabelSet(labels, orderedNames) {
  if (!orderedNames || orderedNames.length === 0) {
    return "";
  }
  const fields = orderedNames.map((name) => `${name}="${escapeLabel(labels[name])}"`);
  return `{${fields.join(",")}}`;
}

function serializeHistogramSeries(metricName, series, labelNames) {
  const lines = [];
  const bucketBounds = Object.keys(series.buckets).map(Number).sort((l, r) => l - r);
  let cumulative = 0;
  for (const bound of bucketBounds) {
    cumulative += Number(series.buckets[String(bound)] || 0);
    lines.push(
      `${metricName}_bucket${serializeLabelSetWithLe(
        series.labels,
        labelNames,
        String(bound)
      )} ${cumulative}`
    );
  }
  lines.push(
    `${metricName}_bucket${serializeLabelSetWithLe(series.labels, labelNames, "+Inf")} ${series.count}`
  );
  lines.push(
    `${metricName}_sum${serializeLabelSet(series.labels, labelNames)} ${Number(
      series.sum.toFixed(3)
    )}`
  );
  lines.push(
    `${metricName}_count${serializeLabelSet(series.labels, labelNames)} ${series.count}`
  );
  return lines;
}

function serializeLabelSetWithLe(labels, orderedNames, leValue) {
  const names = Array.isArray(orderedNames) ? [...orderedNames, "le"] : ["le"];
  const merged = {
    ...(labels || {}),
    le: leValue
  };
  return serializeLabelSet(merged, names);
}

function escapeLabel(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}
