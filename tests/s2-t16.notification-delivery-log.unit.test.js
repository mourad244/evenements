import assert from "node:assert/strict";
import test from "node:test";

import {
  createNotificationLogStore,
  normalizeNotificationLogEntry,
  normalizeNotificationLogQuery
} from "../services/shared/notificationDeliveryLog.js";

test("normalizeNotificationLogEntry normalizes status, channel and numbers", () => {
  const entry = normalizeNotificationLogEntry({
    notificationId: "notif-1",
    messageId: "msg-1",
    templateId: "EMAIL_REGISTRATION_CONFIRMED",
    channel: "email",
    recipientUserId: "user-1",
    status: "sent",
    attemptNumber: "2",
    processedAt: "2026-03-15T10:00:00.000Z",
    correlationId: "corr-1"
  });

  assert.equal(entry.channel, "EMAIL");
  assert.equal(entry.status, "SENT");
  assert.equal(entry.attemptNumber, 2);
});

test("normalizeNotificationLogQuery validates status and channel filters", () => {
  const normalized = normalizeNotificationLogQuery({
    status: ["sent", "failed"],
    channel: "email",
    page: "2",
    pageSize: "10"
  });

  assert.equal(normalized.ok, true);
  assert.deepEqual(normalized.data.status, ["SENT", "FAILED"]);
  assert.deepEqual(normalized.data.channel, ["EMAIL"]);
  assert.equal(normalized.data.page, 2);
});

test("createNotificationLogStore appends and lists entries with filtering", () => {
  const store = createNotificationLogStore();
  store.append({
    notificationId: "notif-1",
    messageId: "msg-1",
    templateId: "EMAIL_REGISTRATION_CONFIRMED",
    channel: "EMAIL",
    recipientUserId: "user-1",
    eventId: "event-1",
    registrationId: "reg-1",
    status: "SENT",
    attemptNumber: 1,
    processedAt: "2026-03-15T10:00:00.000Z",
    correlationId: "corr-1"
  });
  store.append({
    notificationId: "notif-2",
    messageId: "msg-2",
    templateId: "EMAIL_EVENT_CANCELLED",
    channel: "EMAIL",
    recipientUserId: "user-2",
    eventId: "event-2",
    status: "FAILED",
    errorCode: "NOTIFICATION_SEND_FAILED",
    errorMessage: "provider down",
    attemptNumber: 1,
    processedAt: "2026-03-15T11:00:00.000Z",
    correlationId: "corr-2"
  });

  const response = store.list({
    status: "FAILED",
    channel: "EMAIL"
  });

  assert.equal(response.ok, true);
  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.items[0].notificationId, "notif-2");
});

test("createNotificationLogStore appends logs from worker results", () => {
  const store = createNotificationLogStore();
  const appended = store.appendFromWorkerResult({
    data: {
      notificationLog: {
        notificationId: "notif-3",
        messageId: "msg-3",
        templateId: "EMAIL_REGISTRATION_WAITLISTED",
        channel: "EMAIL",
        recipientUserId: "user-3",
        status: "SENT",
        attemptNumber: 1,
        processedAt: "2026-03-15T12:00:00.000Z",
        correlationId: "corr-3"
      }
    }
  });

  assert.equal(appended.notificationId, "notif-3");
  assert.equal(store.getSnapshot().length, 1);
});

test("createNotificationLogStore rejects invalid query filters", () => {
  const store = createNotificationLogStore();
  const response = store.list({
    status: "INVALID"
  });

  assert.equal(response.ok, false);
  assert.equal(response.statusCode, 400);
  assert.equal(response.error.code, "INVALID_FILTERS");
});

test("createNotificationLogStore requires core fields on append", () => {
  const store = createNotificationLogStore();
  assert.throws(
    () =>
      store.append({
        messageId: "msg-x"
      }),
    /required fields/
  );
});
