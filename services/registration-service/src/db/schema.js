export async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registrations (
      registration_id UUID PRIMARY KEY,
      event_id UUID NOT NULL,
      participant_id TEXT NOT NULL,
      participant_name TEXT,
      participant_email TEXT,
      event_title TEXT NOT NULL,
      event_city TEXT NOT NULL,
      event_start_at TIMESTAMPTZ NOT NULL,
      event_capacity INTEGER NOT NULL CHECK (event_capacity > 0),
      registration_status TEXT NOT NULL,
      waitlist_position INTEGER,
      ticket_id TEXT,
      ticket_ref TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      cancelled_at TIMESTAMPTZ,
      promoted_at TIMESTAMPTZ
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      ticket_id UUID PRIMARY KEY,
      registration_id UUID NOT NULL UNIQUE,
      event_id UUID NOT NULL,
      participant_id TEXT NOT NULL,
      ticket_ref TEXT,
      ticket_format TEXT NOT NULL,
      ticket_status TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      FOREIGN KEY (registration_id)
        REFERENCES registrations (registration_id)
        ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id UUID PRIMARY KEY,
      recipient_id TEXT NOT NULL,
      recipient_role TEXT NOT NULL,
      event_id UUID,
      registration_id UUID,
      notification_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata JSONB NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL,
      read_at TIMESTAMPTZ
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id UUID PRIMARY KEY,
      registration_id UUID,
      event_id UUID,
      participant_id TEXT NOT NULL,
      amount INTEGER NOT NULL CHECK (amount >= 0),
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_session_id TEXT,
      provider_payment_id TEXT,
      metadata JSONB NOT NULL,
      last_webhook_id TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_registrations_event_status
      ON registrations (event_id, registration_status, created_at);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_registrations_participant
      ON registrations (participant_id, updated_at DESC);
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_active_event_participant
      ON registrations (event_id, participant_id)
      WHERE registration_status IN ('CONFIRMED', 'WAITLISTED');
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tickets_participant
      ON tickets (participant_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient
      ON notifications (recipient_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_payments_participant
      ON payments (participant_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_payments_registration
      ON payments (registration_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_payments_provider_session
      ON payments (provider_session_id);
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_last_webhook_id
      ON payments (last_webhook_id)
      WHERE last_webhook_id IS NOT NULL;
  `);
}
