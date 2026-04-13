import assert from "node:assert/strict";
import test from "node:test";

import { ensureSchema } from "../services/registration-service/src/db/schema.js";
import { createRegistrationRepository } from "../services/registration-service/src/repositories/registrationRepository.js";

test("registration schema creates a unique index for active participant/event pairs", async () => {
  const queries = [];
  const pool = {
    async query(sql) {
      queries.push(sql);
      return { rows: [] };
    }
  };

  await ensureSchema(pool);

  assert.ok(
    queries.some((sql) =>
      sql.includes("CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_active_event_participant")
    )
  );
});

test("promoteNextWaitlistedWithTicket locks and promotes the first waitlisted registration", async () => {
  const queries = [];
  const client = {
    async query(sql, params) {
      queries.push({ sql, params });

      if (sql === "BEGIN" || sql === "COMMIT") {
        return { rows: [] };
      }

      if (sql.includes("FOR UPDATE SKIP LOCKED")) {
        return {
          rows: [
            {
              registration_id: "reg-1",
              event_id: "evt-1",
              participant_id: "participant-1",
              participant_name: "Sara Bennani",
              participant_email: "sara@example.com",
              event_title: "Atlas Summit",
              event_city: "Casablanca",
              event_start_at: "2026-04-20T09:00:00.000Z",
              event_capacity: 100,
              registration_status: "WAITLISTED",
              waitlist_position: 1,
              ticket_id: null,
              ticket_ref: null,
              created_at: "2026-04-01T10:00:00.000Z",
              updated_at: "2026-04-01T10:00:00.000Z",
              cancelled_at: null,
              promoted_at: null
            }
          ]
        };
      }

      if (sql.includes("UPDATE registrations")) {
        return {
          rows: [
            {
              registration_id: "reg-1",
              event_id: "evt-1",
              participant_id: "participant-1",
              participant_name: "Sara Bennani",
              participant_email: "sara@example.com",
              event_title: "Atlas Summit",
              event_city: "Casablanca",
              event_start_at: "2026-04-20T09:00:00.000Z",
              event_capacity: 100,
              registration_status: "CONFIRMED",
              waitlist_position: null,
              ticket_id: "ticket-1",
              ticket_ref: "TCK-1",
              created_at: "2026-04-01T10:00:00.000Z",
              updated_at: "2026-04-02T10:00:00.000Z",
              cancelled_at: null,
              promoted_at: "2026-04-02T10:00:00.000Z"
            }
          ]
        };
      }

      if (sql.includes("INSERT INTO tickets")) {
        return {
          rows: [
            {
              ticket_id: "ticket-1",
              registration_id: "reg-1",
              event_id: "evt-1",
              participant_id: "participant-1",
              ticket_ref: "TCK-1",
              ticket_format: "PDF",
              ticket_status: "ISSUED",
              payload: { ok: true },
              created_at: "2026-04-02T10:00:00.000Z",
              updated_at: "2026-04-02T10:00:00.000Z"
            }
          ]
        };
      }

      throw new Error(`Unexpected query: ${sql}`);
    },
    release() {}
  };

  const pool = {
    async connect() {
      return client;
    }
  };

  const repository = createRegistrationRepository(pool);
  const promoted = await repository.promoteNextWaitlistedWithTicket(
    "evt-1",
    "2026-04-02T10:00:00.000Z",
    (registration) => ({
      ticketId: "ticket-1",
      registrationId: registration.registrationId,
      eventId: registration.eventId,
      participantId: registration.participantId,
      ticketRef: "TCK-1",
      ticketFormat: "PDF",
      ticketStatus: "ISSUED",
      payload: { ok: true },
      createdAt: "2026-04-02T10:00:00.000Z",
      updatedAt: "2026-04-02T10:00:00.000Z"
    })
  );

  assert.equal(promoted.registration.registrationStatus, "CONFIRMED");
  assert.equal(promoted.ticket.ticketId, "ticket-1");
  assert.ok(queries.some((entry) => entry.sql.includes("FOR UPDATE SKIP LOCKED")));
});

test("promoteNextWaitlistedWithTicket returns null when no candidate is available", async () => {
  const calls = [];
  const client = {
    async query(sql) {
      calls.push(sql);
      if (sql === "BEGIN" || sql === "COMMIT") {
        return { rows: [] };
      }
      if (sql.includes("FOR UPDATE SKIP LOCKED")) {
        return { rows: [] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
    release() {}
  };

  const repository = createRegistrationRepository({
    async connect() {
      return client;
    }
  });

  const promoted = await repository.promoteNextWaitlistedWithTicket(
    "evt-1",
    "2026-04-02T10:00:00.000Z",
    () => {
      throw new Error("should not build a ticket without a registration");
    }
  );

  assert.equal(promoted, null);
  assert.equal(calls.includes("COMMIT"), true);
});
