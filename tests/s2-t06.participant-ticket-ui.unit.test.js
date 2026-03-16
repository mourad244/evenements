import assert from "node:assert/strict";
import test from "node:test";

import {
  mapParticipationRow,
  normalizeRegistrationStatus,
  resolveParticipationTicketCta
} from "../services/shared/participantTicketUi.js";

test("normalizeRegistrationStatus uppercases and defaults to UNKNOWN", () => {
  assert.equal(normalizeRegistrationStatus("confirmed"), "CONFIRMED");
  assert.equal(normalizeRegistrationStatus(" "), "UNKNOWN");
});

test("resolveParticipationTicketCta shows download for eligible confirmed registration", () => {
  const cta = resolveParticipationTicketCta({
    registrationStatus: "CONFIRMED",
    canDownloadTicket: true,
    ticketId: "ticket-1"
  });
  assert.equal(cta.show, true);
  assert.equal(cta.action, "DOWNLOAD");
  assert.equal(cta.ticketId, "ticket-1");
});

test("resolveParticipationTicketCta blocks when event is cancelled", () => {
  const cta = resolveParticipationTicketCta({
    registrationStatus: "CONFIRMED",
    canDownloadTicket: true,
    ticketId: "ticket-1",
    eventStatus: "CANCELLED"
  });
  assert.equal(cta.show, false);
  assert.match(cta.message, /cancelled/i);
});

test("resolveParticipationTicketCta shows waitlist message", () => {
  const cta = resolveParticipationTicketCta({
    registrationStatus: "WAITLISTED",
    canDownloadTicket: false,
    ticketId: ""
  });
  assert.equal(cta.show, false);
  assert.match(cta.message, /waitlist/i);
});

test("resolveParticipationTicketCta shows pending message for confirmed without ticket", () => {
  const cta = resolveParticipationTicketCta({
    registrationStatus: "CONFIRMED",
    canDownloadTicket: false,
    ticketId: ""
  });
  assert.equal(cta.show, false);
  assert.match(cta.message, /generated/i);
});

test("mapParticipationRow returns status label and CTA", () => {
  const row = mapParticipationRow({
    registrationId: "reg-1",
    eventId: "event-1",
    eventTitle: "Forum Tech",
    registrationStatus: "WAITLISTED",
    canDownloadTicket: false,
    ticketId: ""
  });
  assert.equal(row.statusLabel, "Waitlisted");
  assert.equal(row.ticketCta.show, false);
});
