import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNotificationDispatchRequests,
  createNotificationEmailWorker,
  resolveTemplateIdForEvent
} from "../services/shared/notificationEmailWorker.js";
import {
  createMonitoringMetricsEmitter
} from "../services/shared/monitoringMetricsEmission.js";

test("resolveTemplateIdForEvent maps supported business events", () => {
  assert.equal(
    resolveTemplateIdForEvent("registration.confirmed"),
    "EMAIL_REGISTRATION_CONFIRMED"
  );
  assert.equal(resolveTemplateIdForEvent("unknown.event"), null);
});

test("buildNotificationDispatchRequests builds request for registration.confirmed", () => {
  const built = buildNotificationDispatchRequests({
    event: {
      messageId: "msg-1",
      eventName: "registration.confirmed",
      correlationId: "corr-1",
      data: {
        registrationId: "reg-1",
        eventId: "event-1",
        participantId: "user-1",
        recipientEmail: "user@example.com",
        eventTitle: "Forum Tech"
      }
    }
  });

  assert.equal(built.ok, true);
  assert.equal(built.data.length, 1);
  assert.equal(built.data[0].templateId, "EMAIL_REGISTRATION_CONFIRMED");
  assert.equal(built.data[0].recipientEmail, "user@example.com");
});

test("buildNotificationDispatchRequests fans out event.cancelled recipients", () => {
  const built = buildNotificationDispatchRequests({
    event: {
      messageId: "msg-2",
      eventName: "event.cancelled",
      correlationId: "corr-2",
      data: {
        eventId: "event-2",
        eventTitle: "Data Day",
        recipients: [
          {
            recipientUserId: "user-1",
            recipientEmail: "one@example.com"
          },
          {
            recipientUserId: "user-2",
            recipientEmail: "two@example.com"
          }
        ]
      }
    }
  });

  assert.equal(built.ok, true);
  assert.equal(built.data.length, 2);
  assert.equal(built.data[1].messageId, "msg-2:2");
});

test("buildNotificationDispatchRequests supports notification.email.requested", () => {
  const built = buildNotificationDispatchRequests({
    event: {
      messageId: "msg-3",
      eventName: "notification.email.requested",
      correlationId: "corr-3",
      data: {
        templateId: "EMAIL_EVENT_REMINDER",
        recipientUserId: "user-3",
        recipientEmail: "three@example.com",
        context: {
          eventId: "event-3"
        }
      }
    }
  });

  assert.equal(built.ok, true);
  assert.equal(built.data[0].templateId, "EMAIL_EVENT_REMINDER");
});

test("worker processes dispatch request successfully and records SENT metrics", async () => {
  const emitter = createMonitoringMetricsEmitter({
    serviceName: "notification-service"
  });
  const worker = createNotificationEmailWorker({
    templateRenderer: async ({ templateId }) => ({
      subject: `${templateId} subject`,
      html: "<p>Hello</p>",
      text: "Hello"
    }),
    sendEmail: async () => ({
      providerMessageId: "provider-1"
    }),
    metricsEmitter: emitter,
    nowFn: () => "2026-03-14T10:00:00.000Z"
  });

  const result = await worker.processDispatchRequest({
    dispatchRequest: {
      messageId: "msg-4",
      templateId: "EMAIL_REGISTRATION_CONFIRMED",
      channel: "EMAIL",
      recipientUserId: "user-4",
      recipientEmail: "four@example.com",
      correlationId: "corr-4",
      context: {
        eventId: "event-4",
        registrationId: "reg-4"
      }
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.notificationLog.status, "SENT");
  assert.equal(result.data.providerMessageId, "provider-1");

  const snapshot = emitter.registry.getSnapshot();
  const sentSeries = snapshot.counters.find(
    (series) =>
      series.name === "notification_send_total" &&
      series.labels.status === "SENT"
  );
  assert.equal(sentSeries.value, 1);
});

test("worker deduplicates already processed messageId", async () => {
  const worker = createNotificationEmailWorker({
    templateRenderer: async () => ({
      subject: "subject",
      html: "<p>Hello</p>",
      text: "Hello"
    }),
    sendEmail: async () => ({
      providerMessageId: "provider-2"
    }),
    processedMessageStore: new Set(["msg-5"]),
    nowFn: () => "2026-03-14T10:00:00.000Z"
  });

  const result = await worker.processDispatchRequest({
    dispatchRequest: {
      messageId: "msg-5",
      templateId: "EMAIL_REGISTRATION_WAITLISTED",
      channel: "EMAIL",
      recipientUserId: "user-5",
      recipientEmail: "five@example.com",
      correlationId: "corr-5",
      context: {
        eventId: "event-5"
      }
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.duplicate, true);
});

test("worker returns FAILED log when template rendering fails", async () => {
  const worker = createNotificationEmailWorker({
    templateRenderer: async () => {
      throw new Error("render failed");
    },
    sendEmail: async () => ({
      providerMessageId: "provider-3"
    }),
    nowFn: () => "2026-03-14T10:00:00.000Z"
  });

  const result = await worker.processDispatchRequest({
    dispatchRequest: {
      messageId: "msg-6",
      templateId: "EMAIL_REGISTRATION_PROMOTED",
      channel: "EMAIL",
      recipientUserId: "user-6",
      recipientEmail: "six@example.com",
      correlationId: "corr-6",
      context: {
        eventId: "event-6"
      }
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 422);
  assert.equal(result.data.notificationLog.status, "FAILED");
  assert.equal(result.data.notificationLog.errorCode, "TEMPLATE_RENDER_FAILED");
});

test("worker returns FAILED log when provider send fails", async () => {
  const emitter = createMonitoringMetricsEmitter({
    serviceName: "notification-service"
  });
  const worker = createNotificationEmailWorker({
    templateRenderer: async () => ({
      subject: "subject",
      html: "<p>Hello</p>",
      text: "Hello"
    }),
    sendEmail: async () => {
      throw new Error("provider down");
    },
    metricsEmitter: emitter,
    nowFn: () => "2026-03-14T10:00:00.000Z"
  });

  const result = await worker.processDispatchRequest({
    dispatchRequest: {
      messageId: "msg-7",
      templateId: "EMAIL_EVENT_CANCELLED",
      channel: "EMAIL",
      recipientUserId: "user-7",
      recipientEmail: "seven@example.com",
      correlationId: "corr-7",
      context: {
        eventId: "event-7"
      }
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 502);
  assert.equal(result.data.notificationLog.status, "FAILED");

  const snapshot = emitter.registry.getSnapshot();
  const failedSeries = snapshot.counters.find(
    (series) =>
      series.name === "notification_send_failed_total" &&
      series.labels.errorClass === "PROVIDER_ERROR"
  );
  assert.equal(failedSeries.value, 1);
});
