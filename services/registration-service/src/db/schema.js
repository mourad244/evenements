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
    CREATE INDEX IF NOT EXISTS idx_registrations_event_status
      ON registrations (event_id, registration_status, created_at);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_registrations_participant
      ON registrations (participant_id, updated_at DESC);
  `);
}
