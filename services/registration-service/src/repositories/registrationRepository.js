function mapRegistration(row) {
  if (!row) return null;
  return {
    registrationId: row.registration_id,
    eventId: row.event_id,
    participantId: row.participant_id,
    participantName: row.participant_name,
    participantEmail: row.participant_email,
    eventTitle: row.event_title,
    eventCity: row.event_city,
    eventStartAt: row.event_start_at,
    eventCapacity: row.event_capacity,
    registrationStatus: row.registration_status,
    waitlistPosition: row.waitlist_position,
    ticketId: row.ticket_id,
    ticketRef: row.ticket_ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cancelledAt: row.cancelled_at,
    promotedAt: row.promoted_at
  };
}

const BASE_SELECT = `
  SELECT
    registration_id,
    event_id,
    participant_id,
    participant_name,
    participant_email,
    event_title,
    event_city,
    event_start_at,
    event_capacity,
    registration_status,
    waitlist_position,
    ticket_id,
    ticket_ref,
    created_at,
    updated_at,
    cancelled_at,
    promoted_at
  FROM registrations
`;

export function createRegistrationRepository(pool) {
  return {
    async checkConnection() {
      await pool.query("SELECT 1");
    },

    async findActiveByEventAndParticipant(eventId, participantId) {
      const { rows } = await pool.query(
        `
          ${BASE_SELECT}
          WHERE event_id = $1
            AND participant_id = $2
            AND registration_status IN ('CONFIRMED', 'WAITLISTED')
          LIMIT 1
        `,
        [eventId, participantId]
      );
      return mapRegistration(rows[0]);
    },

    async countConfirmedByEvent(eventId) {
      const { rows } = await pool.query(
        `
          SELECT COUNT(*)::int AS total
          FROM registrations
          WHERE event_id = $1
            AND registration_status = 'CONFIRMED'
        `,
        [eventId]
      );
      return rows[0]?.total || 0;
    },

    async countWaitlistedByEvent(eventId) {
      const { rows } = await pool.query(
        `
          SELECT COUNT(*)::int AS total
          FROM registrations
          WHERE event_id = $1
            AND registration_status = 'WAITLISTED'
        `,
        [eventId]
      );
      return rows[0]?.total || 0;
    },

    async createRegistration(registration) {
      const { rows } = await pool.query(
        `
          INSERT INTO registrations (
            registration_id,
            event_id,
            participant_id,
            participant_name,
            participant_email,
            event_title,
            event_city,
            event_start_at,
            event_capacity,
            registration_status,
            waitlist_position,
            ticket_id,
            ticket_ref,
            created_at,
            updated_at,
            cancelled_at,
            promoted_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
          RETURNING *
        `,
        [
          registration.registrationId,
          registration.eventId,
          registration.participantId,
          registration.participantName,
          registration.participantEmail,
          registration.eventTitle,
          registration.eventCity,
          registration.eventStartAt,
          registration.eventCapacity,
          registration.registrationStatus,
          registration.waitlistPosition,
          registration.ticketId,
          registration.ticketRef,
          registration.createdAt,
          registration.updatedAt,
          registration.cancelledAt,
          registration.promotedAt
        ]
      );
      return mapRegistration(rows[0]);
    },

    async listParticipations({ participantId, status, page, pageSize }) {
      const offset = (page - 1) * pageSize;
      const params = [participantId];
      const whereClauses = ["participant_id = $1"];

      if (status) {
        params.push(status);
        whereClauses.push(`registration_status = $${params.length}`);
      }

      const whereSql = whereClauses.join(" AND ");
      const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total FROM registrations WHERE ${whereSql}`,
        params
      );
      const total = countResult.rows[0]?.total || 0;

      params.push(pageSize);
      params.push(offset);
      const { rows } = await pool.query(
        `
          ${BASE_SELECT}
          WHERE ${whereSql}
          ORDER BY updated_at DESC, created_at DESC
          LIMIT $${params.length - 1}
          OFFSET $${params.length}
        `,
        params
      );

      return {
        items: rows.map(mapRegistration),
        total
      };
    },

    async listEventRegistrations(eventId) {
      const { rows } = await pool.query(
        `
          ${BASE_SELECT}
          WHERE event_id = $1
          ORDER BY created_at ASC
        `,
        [eventId]
      );
      return rows.map(mapRegistration);
    },

    async findById(registrationId) {
      const { rows } = await pool.query(
        `
          ${BASE_SELECT}
          WHERE registration_id = $1
          LIMIT 1
        `,
        [registrationId]
      );
      return mapRegistration(rows[0]);
    },

    async cancelRegistration(registrationId, updatedAt) {
      const { rows } = await pool.query(
        `
          UPDATE registrations
          SET registration_status = 'CANCELLED',
              updated_at = $2,
              cancelled_at = $2,
              waitlist_position = NULL
          WHERE registration_id = $1
          RETURNING *
        `,
        [registrationId, updatedAt]
      );
      return mapRegistration(rows[0]);
    },

    async findNextWaitlisted(eventId) {
      const { rows } = await pool.query(
        `
          ${BASE_SELECT}
          WHERE event_id = $1
            AND registration_status = 'WAITLISTED'
          ORDER BY waitlist_position ASC NULLS LAST, created_at ASC
          LIMIT 1
        `,
        [eventId]
      );
      return mapRegistration(rows[0]);
    },

    async promoteRegistration(registrationId, updatedAt, ticketId, ticketRef) {
      const { rows } = await pool.query(
        `
          UPDATE registrations
          SET registration_status = 'CONFIRMED',
              updated_at = $2,
              promoted_at = $2,
              waitlist_position = NULL,
              ticket_id = $3,
              ticket_ref = $4
          WHERE registration_id = $1
          RETURNING *
        `,
        [registrationId, updatedAt, ticketId, ticketRef]
      );
      return mapRegistration(rows[0]);
    }
  };
}
