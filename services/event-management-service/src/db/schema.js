export async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      event_id UUID PRIMARY KEY,
      organizer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      theme TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      city TEXT NOT NULL,
      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ,
      timezone TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      visibility TEXT NOT NULL,
      pricing_type TEXT NOT NULL,
      status TEXT NOT NULL,
      cover_image_ref TEXT,
      scheduled_publish_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      deleted_at TIMESTAMPTZ
    );
  `);

  await pool.query(`
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_organizer_status
      ON events (organizer_id, status)
      WHERE deleted_at IS NULL;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_scheduled_publish_due
      ON events (scheduled_publish_at, status)
      WHERE deleted_at IS NULL AND scheduled_publish_at IS NOT NULL;
  `);
}
