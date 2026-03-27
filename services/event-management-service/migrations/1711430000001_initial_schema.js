export const up = (pgm) => {
  pgm.sql(`
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
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      deleted_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_events_organizer_status
      ON events (organizer_id, status)
      WHERE deleted_at IS NULL;
  `);
};

export const down = (pgm) => {
  pgm.sql("DROP TABLE IF EXISTS events");
};
