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

function mapTicket(row) {
  if (!row) return null;
  return {
    ticketId: row.ticket_id,
    registrationId: row.registration_id,
    eventId: row.event_id,
    participantId: row.participant_id,
    ticketRef: row.ticket_ref,
    ticketFormat: row.ticket_format,
    ticketStatus: row.ticket_status,
    payload: row.payload,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapNotification(row) {
  if (!row) return null;
  return {
    notificationId: row.notification_id,
    recipientId: row.recipient_id,
    recipientRole: row.recipient_role,
    eventId: row.event_id,
    registrationId: row.registration_id,
    notificationType: row.notification_type,
    title: row.title,
    message: row.message,
    metadata: row.metadata,
    isRead: row.is_read,
    createdAt: row.created_at,
    readAt: row.read_at
  };
}

function mapPayment(row) {
  if (!row) return null;
  return {
    paymentId: row.payment_id,
    registrationId: row.registration_id,
    eventId: row.event_id,
    participantId: row.participant_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    provider: row.provider,
    providerSessionId: row.provider_session_id,
    providerPaymentId: row.provider_payment_id,
    lastWebhookId: row.last_webhook_id,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at
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

const TICKET_SELECT = `
  SELECT
    ticket_id,
    registration_id,
    event_id,
    participant_id,
    ticket_ref,
    ticket_format,
    ticket_status,
    payload,
    created_at,
    updated_at
  FROM tickets
`;

const NOTIFICATION_SELECT = `
  SELECT
    notification_id,
    recipient_id,
    recipient_role,
    event_id,
    registration_id,
    notification_type,
    title,
    message,
    metadata,
    is_read,
    created_at,
    read_at
  FROM notifications
`;

const PAYMENT_SELECT = `
  SELECT
    payment_id,
    registration_id,
    event_id,
    participant_id,
    amount,
    currency,
    status,
    provider,
    provider_session_id,
    provider_payment_id,
    last_webhook_id,
    metadata,
    created_at,
    updated_at
  FROM payments
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

    async createRegistrationWithTicket(registration, ticketPayload) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const registrationResult = await client.query(
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

        const ticketResult = await client.query(
          `
            INSERT INTO tickets (
              ticket_id,
              registration_id,
              event_id,
              participant_id,
              ticket_ref,
              ticket_format,
              ticket_status,
              payload,
              created_at,
              updated_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
          `,
          [
            ticketPayload.ticketId,
            ticketPayload.registrationId,
            ticketPayload.eventId,
            ticketPayload.participantId,
            ticketPayload.ticketRef,
            ticketPayload.ticketFormat,
            ticketPayload.ticketStatus,
            ticketPayload.payload,
            ticketPayload.createdAt,
            ticketPayload.updatedAt
          ]
        );

        await client.query("COMMIT");
        return {
          registration: mapRegistration(registrationResult.rows[0]),
          ticket: mapTicket(ticketResult.rows[0])
        };
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
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

    async updateRegistrationTicket(registrationId, ticketId, ticketRef, updatedAt) {
      const { rows } = await pool.query(
        `
          UPDATE registrations
          SET ticket_id = $2,
              ticket_ref = $3,
              updated_at = $4
          WHERE registration_id = $1
          RETURNING *
        `,
        [registrationId, ticketId, ticketRef, updatedAt]
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
    },

    async promoteRegistrationWithTicket(
      registrationId,
      updatedAt,
      ticketId,
      ticketRef,
      ticketPayload
    ) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const registrationResult = await client.query(
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

        const ticketResult = await client.query(
          `
            INSERT INTO tickets (
              ticket_id,
              registration_id,
              event_id,
              participant_id,
              ticket_ref,
              ticket_format,
              ticket_status,
              payload,
              created_at,
              updated_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
          `,
          [
            ticketPayload.ticketId,
            ticketPayload.registrationId,
            ticketPayload.eventId,
            ticketPayload.participantId,
            ticketPayload.ticketRef,
            ticketPayload.ticketFormat,
            ticketPayload.ticketStatus,
            ticketPayload.payload,
            ticketPayload.createdAt,
            ticketPayload.updatedAt
          ]
        );

        await client.query("COMMIT");
        return {
          registration: mapRegistration(registrationResult.rows[0]),
          ticket: mapTicket(ticketResult.rows[0])
        };
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },

    async createTicket(payload) {
      const { rows } = await pool.query(
        `
          INSERT INTO tickets (
            ticket_id,
            registration_id,
            event_id,
            participant_id,
            ticket_ref,
            ticket_format,
            ticket_status,
            payload,
            created_at,
            updated_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          RETURNING *
        `,
        [
          payload.ticketId,
          payload.registrationId,
          payload.eventId,
          payload.participantId,
          payload.ticketRef,
          payload.ticketFormat,
          payload.ticketStatus,
          payload.payload,
          payload.createdAt,
          payload.updatedAt
        ]
      );
      return mapTicket(rows[0]);
    },

    async findTicketById(ticketId) {
      const { rows } = await pool.query(
        `
          ${TICKET_SELECT}
          WHERE ticket_id = $1
          LIMIT 1
        `,
        [ticketId]
      );
      return mapTicket(rows[0]);
    },

    async findTicketByRegistration(registrationId) {
      const { rows } = await pool.query(
        `
          ${TICKET_SELECT}
          WHERE registration_id = $1
          LIMIT 1
        `,
        [registrationId]
      );
      return mapTicket(rows[0]);
    },

    async updateTicketStatus(ticketId, status, updatedAt) {
      const { rows } = await pool.query(
        `
          UPDATE tickets
          SET ticket_status = $2,
              updated_at = $3
          WHERE ticket_id = $1
          RETURNING *
        `,
        [ticketId, status, updatedAt]
      );
      return mapTicket(rows[0]);
    },

    async createNotification(notification) {
      const { rows } = await pool.query(
        `
          INSERT INTO notifications (
            notification_id,
            recipient_id,
            recipient_role,
            event_id,
            registration_id,
            notification_type,
            title,
            message,
            metadata,
            is_read,
            created_at,
            read_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
          RETURNING *
        `,
        [
          notification.notificationId,
          notification.recipientId,
          notification.recipientRole,
          notification.eventId,
          notification.registrationId,
          notification.notificationType,
          notification.title,
          notification.message,
          notification.metadata,
          notification.isRead,
          notification.createdAt,
          notification.readAt
        ]
      );
      return mapNotification(rows[0]);
    },

    async listNotifications({ recipientId, page, pageSize }) {
      const offset = (page - 1) * pageSize;
      const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total FROM notifications WHERE recipient_id = $1`,
        [recipientId]
      );
      const total = countResult.rows[0]?.total || 0;
      const { rows } = await pool.query(
        `
          ${NOTIFICATION_SELECT}
          WHERE recipient_id = $1
          ORDER BY created_at DESC
          LIMIT $2
          OFFSET $3
        `,
        [recipientId, pageSize, offset]
      );
      return {
        items: rows.map(mapNotification),
        total
      };
    },

    async markNotificationRead(notificationId, recipientId, readAt) {
      const { rows } = await pool.query(
        `
          UPDATE notifications
          SET is_read = TRUE,
              read_at = $3
          WHERE notification_id = $1
            AND recipient_id = $2
          RETURNING *
        `,
        [notificationId, recipientId, readAt]
      );
      return mapNotification(rows[0]);
    },

    async createPaymentSession(payment) {
      const { rows } = await pool.query(
        `
          INSERT INTO payments (
            payment_id,
            registration_id,
            event_id,
            participant_id,
            amount,
            currency,
            status,
            provider,
            provider_session_id,
            provider_payment_id,
            last_webhook_id,
            metadata,
            created_at,
            updated_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
          RETURNING *
        `,
        [
          payment.paymentId,
          payment.registrationId,
          payment.eventId,
          payment.participantId,
          payment.amount,
          payment.currency,
          payment.status,
          payment.provider,
          payment.providerSessionId,
          payment.providerPaymentId,
          payment.lastWebhookId,
          payment.metadata,
          payment.createdAt,
          payment.updatedAt
        ]
      );
      return mapPayment(rows[0]);
    },

    async findPaymentById(paymentId) {
      const { rows } = await pool.query(
        `
          ${PAYMENT_SELECT}
          WHERE payment_id = $1
          LIMIT 1
        `,
        [paymentId]
      );
      return mapPayment(rows[0]);
    },

    async findPaymentByProviderSessionId(providerSessionId) {
      const { rows } = await pool.query(
        `
          ${PAYMENT_SELECT}
          WHERE provider_session_id = $1
          LIMIT 1
        `,
        [providerSessionId]
      );
      return mapPayment(rows[0]);
    },

    async updatePaymentStatus(
      paymentId,
      status,
      providerPaymentId,
      webhookId,
      updatedAt
    ) {
      const { rows } = await pool.query(
        `
          UPDATE payments
          SET status = $2,
              provider_payment_id = COALESCE($3, provider_payment_id),
              last_webhook_id = $4,
              updated_at = $5
          WHERE payment_id = $1
            AND (last_webhook_id IS NULL OR last_webhook_id <> $4)
          RETURNING *
        `,
        [paymentId, status, providerPaymentId, webhookId, updatedAt]
      );
      return mapPayment(rows[0]);
    }
  };
}
