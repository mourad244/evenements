import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNotificationMessage,
  isValidTemplateId,
  renderSubject,
  renderTextBody,
  TEMPLATE_IDS,
  validateTemplateVariables
} from "../services/shared/notificationEmailTemplates.js";

const BASE_VARS = {
  recipientUserId: "user-111",
  recipientEmail: "participant@example.com",
  firstName: "Alice",
  eventId: "evt-aaa",
  eventTitle: "Tech Summit 2026",
  correlationId: "corr-xyz",
  registrationId: "reg-bbb"
};

// ── TEMPLATE_IDS ───────────────────────────────────────────────────────────

test("TEMPLATE_IDS exposes all 5 canonical template keys", () => {
  assert.equal(TEMPLATE_IDS.REGISTRATION_CONFIRMED,  "EMAIL_REGISTRATION_CONFIRMED");
  assert.equal(TEMPLATE_IDS.REGISTRATION_WAITLISTED, "EMAIL_REGISTRATION_WAITLISTED");
  assert.equal(TEMPLATE_IDS.REGISTRATION_PROMOTED,   "EMAIL_REGISTRATION_PROMOTED");
  assert.equal(TEMPLATE_IDS.EVENT_REMINDER,          "EMAIL_EVENT_REMINDER");
  assert.equal(TEMPLATE_IDS.EVENT_CANCELLED,         "EMAIL_EVENT_CANCELLED");
});

// ── isValidTemplateId ──────────────────────────────────────────────────────

test("isValidTemplateId returns true for all 5 known templates", () => {
  for (const id of Object.values(TEMPLATE_IDS)) {
    assert.ok(isValidTemplateId(id), `should accept ${id}`);
  }
});

test("isValidTemplateId returns false for unknown templateId", () => {
  assert.equal(isValidTemplateId("EMAIL_PASSWORD_RESET"), false);
  assert.equal(isValidTemplateId(""), false);
  assert.equal(isValidTemplateId(null), false);
});

// ── validateTemplateVariables ──────────────────────────────────────────────

test("validateTemplateVariables accepts full valid payload for CONFIRMED", () => {
  const result = validateTemplateVariables(TEMPLATE_IDS.REGISTRATION_CONFIRMED, BASE_VARS);
  assert.equal(result.valid, true);
  assert.deepEqual(result.missing, []);
});

test("validateTemplateVariables detects missing common fields", () => {
  const vars = { ...BASE_VARS, recipientEmail: "" };
  const result = validateTemplateVariables(TEMPLATE_IDS.REGISTRATION_CONFIRMED, vars);
  assert.equal(result.valid, false);
  assert.ok(result.missing.includes("recipientEmail"));
});

test("validateTemplateVariables detects missing registrationId for WAITLISTED", () => {
  const { registrationId: _omit, ...vars } = BASE_VARS;
  const result = validateTemplateVariables(TEMPLATE_IDS.REGISTRATION_WAITLISTED, vars);
  assert.equal(result.valid, false);
  assert.ok(result.missing.includes("registrationId"));
});

test("validateTemplateVariables detects missing eventDate for EVENT_REMINDER", () => {
  const result = validateTemplateVariables(TEMPLATE_IDS.EVENT_REMINDER, BASE_VARS);
  assert.equal(result.valid, false);
  assert.ok(result.missing.includes("eventDate"));
});

test("validateTemplateVariables accepts EVENT_REMINDER with eventDate", () => {
  const vars = { ...BASE_VARS, eventDate: "2026-06-15T18:00:00Z" };
  const result = validateTemplateVariables(TEMPLATE_IDS.EVENT_REMINDER, vars);
  assert.equal(result.valid, true);
});

test("validateTemplateVariables accepts EVENT_CANCELLED without registrationId", () => {
  const { registrationId: _omit, ...vars } = BASE_VARS;
  const result = validateTemplateVariables(TEMPLATE_IDS.EVENT_CANCELLED, vars);
  assert.equal(result.valid, true);
});

test("validateTemplateVariables returns invalid for unknown templateId", () => {
  const result = validateTemplateVariables("UNKNOWN_TEMPLATE", BASE_VARS);
  assert.equal(result.valid, false);
  assert.ok(result.missing[0].includes("Unknown templateId"));
});

// ── renderSubject ──────────────────────────────────────────────────────────

test("renderSubject CONFIRMED contains event title", () => {
  const subject = renderSubject(TEMPLATE_IDS.REGISTRATION_CONFIRMED, BASE_VARS);
  assert.ok(subject.includes("Tech Summit 2026"));
  assert.ok(subject.toLowerCase().includes("confirm"));
});

test("renderSubject WAITLISTED mentions waitlist", () => {
  const subject = renderSubject(TEMPLATE_IDS.REGISTRATION_WAITLISTED, BASE_VARS);
  assert.ok(subject.toLowerCase().includes("waitlist"));
});

test("renderSubject PROMOTED signals positive news", () => {
  const subject = renderSubject(TEMPLATE_IDS.REGISTRATION_PROMOTED, BASE_VARS);
  assert.ok(subject.toLowerCase().includes("waitlist") || subject.toLowerCase().includes("confirmed"));
});

test("renderSubject EVENT_REMINDER contains reminder keyword", () => {
  const subject = renderSubject(TEMPLATE_IDS.EVENT_REMINDER, BASE_VARS);
  assert.ok(subject.toLowerCase().includes("reminder"));
});

test("renderSubject EVENT_CANCELLED contains cancelled keyword", () => {
  const subject = renderSubject(TEMPLATE_IDS.EVENT_CANCELLED, BASE_VARS);
  assert.ok(subject.toLowerCase().includes("cancel"));
});

test("renderSubject falls back gracefully when eventTitle is missing", () => {
  const subject = renderSubject(TEMPLATE_IDS.REGISTRATION_CONFIRMED, {});
  assert.ok(typeof subject === "string" && subject.length > 0);
});

// ── renderTextBody ──────────────────────────────────────────────────────────

test("renderTextBody CONFIRMED addresses recipient by firstName", () => {
  const body = renderTextBody(TEMPLATE_IDS.REGISTRATION_CONFIRMED, BASE_VARS);
  assert.ok(body.includes("Alice"));
  assert.ok(body.includes("Tech Summit 2026"));
});

test("renderTextBody CONFIRMED includes ticket URL when provided", () => {
  const vars = { ...BASE_VARS, ticketDownloadUrl: "https://example.com/ticket/123" };
  const body = renderTextBody(TEMPLATE_IDS.REGISTRATION_CONFIRMED, vars);
  assert.ok(body.includes("https://example.com/ticket/123"));
});

test("renderTextBody CONFIRMED omits ticket line when URL absent", () => {
  const body = renderTextBody(TEMPLATE_IDS.REGISTRATION_CONFIRMED, BASE_VARS);
  assert.ok(!body.includes("Download your ticket"), "no ticket line without URL");
});

test("renderTextBody WAITLISTED includes waitlist position when provided", () => {
  const vars = { ...BASE_VARS, waitlistPosition: 3 };
  const body = renderTextBody(TEMPLATE_IDS.REGISTRATION_WAITLISTED, vars);
  assert.ok(body.includes("3"));
});

test("renderTextBody WAITLISTED works without waitlist position", () => {
  const body = renderTextBody(TEMPLATE_IDS.REGISTRATION_WAITLISTED, BASE_VARS);
  assert.ok(body.includes("waitlist"));
});

test("renderTextBody EVENT_REMINDER includes event date", () => {
  const vars = { ...BASE_VARS, eventDate: "2026-06-15", eventLocation: "Paris" };
  const body = renderTextBody(TEMPLATE_IDS.EVENT_REMINDER, vars);
  assert.ok(body.includes("2026-06-15"));
  assert.ok(body.includes("Paris"));
});

test("renderTextBody EVENT_CANCELLED includes reason when provided", () => {
  const vars = { ...BASE_VARS, cancelReasonCode: "ORGANIZER_REQUEST" };
  const body = renderTextBody(TEMPLATE_IDS.EVENT_CANCELLED, vars);
  assert.ok(body.includes("ORGANIZER_REQUEST"));
});

test("renderTextBody uses fallback greeting when firstName is absent", () => {
  const { firstName: _omit, ...vars } = BASE_VARS;
  const body = renderTextBody(TEMPLATE_IDS.REGISTRATION_CONFIRMED, vars);
  assert.ok(body.includes("Hi there"));
});

// ── buildNotificationMessage ───────────────────────────────────────────────

test("buildNotificationMessage returns correct shape with status PENDING", () => {
  const msg = buildNotificationMessage(TEMPLATE_IDS.REGISTRATION_CONFIRMED, BASE_VARS);
  assert.equal(msg.templateId, TEMPLATE_IDS.REGISTRATION_CONFIRMED);
  assert.equal(msg.channel, "EMAIL");
  assert.equal(msg.recipientEmail, "participant@example.com");
  assert.equal(msg.recipientUserId, "user-111");
  assert.equal(msg.eventId, "evt-aaa");
  assert.equal(msg.registrationId, "reg-bbb");
  assert.equal(msg.correlationId, "corr-xyz");
  assert.equal(msg.status, "PENDING");
  assert.ok(msg.subject.length > 0);
  assert.ok(msg.textBody.length > 0);
});

test("buildNotificationMessage sets registrationId to null when absent", () => {
  const { registrationId: _omit, ...vars } = BASE_VARS;
  const msg = buildNotificationMessage(TEMPLATE_IDS.EVENT_CANCELLED, vars);
  assert.equal(msg.registrationId, null);
});

test("buildNotificationMessage channel is always EMAIL", () => {
  for (const id of Object.values(TEMPLATE_IDS)) {
    const msg = buildNotificationMessage(id, { ...BASE_VARS, eventDate: "2026-06-01" });
    assert.equal(msg.channel, "EMAIL", `channel should be EMAIL for ${id}`);
  }
});
