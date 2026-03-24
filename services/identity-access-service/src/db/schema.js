export async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_users (
      user_id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      city TEXT,
      bio TEXT,
      role TEXT NOT NULL,
      account_status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      last_login_at TIMESTAMPTZ
    );
  `);

  await pool.query(`
    ALTER TABLE auth_users
      ADD COLUMN IF NOT EXISTS full_name TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      session_id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth_users(user_id) ON DELETE CASCADE,
      refresh_token_digest TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
      ON auth_sessions (user_id);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_password_reset_tokens (
      reset_token_id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth_users(user_id) ON DELETE CASCADE,
      token_digest TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_auth_reset_tokens_user_id
      ON auth_password_reset_tokens (user_id);
  `);
}
