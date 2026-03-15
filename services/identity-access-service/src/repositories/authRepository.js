function mapUser(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    role: row.role,
    accountStatus: row.account_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at
  };
}

function mapSession(row) {
  if (!row) return null;
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    refreshTokenDigest: row.refresh_token_digest,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at
  };
}

function mapResetToken(row) {
  if (!row) return null;
  return {
    resetTokenId: row.reset_token_id,
    userId: row.user_id,
    tokenDigest: row.token_digest,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
    createdAt: row.created_at
  };
}

export function createAuthRepository(pool) {
  async function withTransaction(fn) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  return {
    async checkConnection() {
      await pool.query("SELECT 1");
    },

    async findUserByEmail(email) {
      const { rows } = await pool.query(
        `
          SELECT
            user_id,
            email,
            password_hash,
            display_name,
            role,
            account_status,
            created_at,
            updated_at,
            last_login_at
          FROM auth_users
          WHERE email = $1
          LIMIT 1
        `,
        [email]
      );
      return mapUser(rows[0]);
    },

    async findUserById(userId) {
      const { rows } = await pool.query(
        `
          SELECT
            user_id,
            email,
            password_hash,
            display_name,
            role,
            account_status,
            created_at,
            updated_at,
            last_login_at
          FROM auth_users
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId]
      );
      return mapUser(rows[0]);
    },

    async listUsers() {
      const { rows } = await pool.query(
        `
          SELECT
            user_id,
            email,
            password_hash,
            display_name,
            role,
            account_status,
            created_at,
            updated_at,
            last_login_at
          FROM auth_users
          ORDER BY created_at DESC
        `
      );
      return rows.map(mapUser);
    },

    async createUser(user) {
      const { rows } = await pool.query(
        `
          INSERT INTO auth_users (
            user_id,
            email,
            password_hash,
            display_name,
            role,
            account_status,
            created_at,
            updated_at,
            last_login_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING
            user_id,
            email,
            password_hash,
            display_name,
            role,
            account_status,
            created_at,
            updated_at,
            last_login_at
        `,
        [
          user.userId,
          user.email,
          user.passwordHash,
          user.displayName,
          user.role,
          user.accountStatus,
          user.createdAt,
          user.updatedAt,
          user.lastLoginAt
        ]
      );
      return mapUser(rows[0]);
    },

    async touchUserLogin(userId, loggedAt) {
      const { rows } = await pool.query(
        `
          UPDATE auth_users
          SET last_login_at = $2, updated_at = $2
          WHERE user_id = $1
          RETURNING
            user_id,
            email,
            password_hash,
            display_name,
            role,
            account_status,
            created_at,
            updated_at,
            last_login_at
        `,
        [userId, loggedAt]
      );
      return mapUser(rows[0]);
    },

    async updateUserPassword(client, userId, passwordHash, updatedAt) {
      const { rows } = await client.query(
        `
          UPDATE auth_users
          SET password_hash = $2, updated_at = $3
          WHERE user_id = $1
          RETURNING
            user_id,
            email,
            password_hash,
            display_name,
            role,
            account_status,
            created_at,
            updated_at,
            last_login_at
        `,
        [userId, passwordHash, updatedAt]
      );
      return mapUser(rows[0]);
    },

    async createSession(session) {
      const { rows } = await pool.query(
        `
          INSERT INTO auth_sessions (
            session_id,
            user_id,
            refresh_token_digest,
            expires_at,
            revoked_at,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING
            session_id,
            user_id,
            refresh_token_digest,
            expires_at,
            revoked_at,
            created_at
        `,
        [
          session.sessionId,
          session.userId,
          session.refreshTokenDigest,
          session.expiresAt,
          session.revokedAt,
          session.createdAt
        ]
      );
      return mapSession(rows[0]);
    },

    async findSessionById(sessionId) {
      const { rows } = await pool.query(
        `
          SELECT
            session_id,
            user_id,
            refresh_token_digest,
            expires_at,
            revoked_at,
            created_at
          FROM auth_sessions
          WHERE session_id = $1
          LIMIT 1
        `,
        [sessionId]
      );
      return mapSession(rows[0]);
    },

    async updateSessionRefresh(sessionId, refreshTokenDigest, expiresAt) {
      const { rows } = await pool.query(
        `
          UPDATE auth_sessions
          SET refresh_token_digest = $2, expires_at = $3
          WHERE session_id = $1
          RETURNING
            session_id,
            user_id,
            refresh_token_digest,
            expires_at,
            revoked_at,
            created_at
        `,
        [sessionId, refreshTokenDigest, expiresAt]
      );
      return mapSession(rows[0]);
    },

    async revokeAllSessionsForUser(client, userId, revokedAt) {
      await client.query(
        `
          UPDATE auth_sessions
          SET revoked_at = $2
          WHERE user_id = $1
            AND revoked_at IS NULL
        `,
        [userId, revokedAt]
      );
    },

    async createResetToken(resetToken) {
      const { rows } = await pool.query(
        `
          INSERT INTO auth_password_reset_tokens (
            reset_token_id,
            user_id,
            token_digest,
            expires_at,
            consumed_at,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING
            reset_token_id,
            user_id,
            token_digest,
            expires_at,
            consumed_at,
            created_at
        `,
        [
          resetToken.resetTokenId,
          resetToken.userId,
          resetToken.tokenDigest,
          resetToken.expiresAt,
          resetToken.consumedAt,
          resetToken.createdAt
        ]
      );
      return mapResetToken(rows[0]);
    },

    async findResetTokenByDigest(client, tokenDigest, forUpdate = false) {
      const lockClause = forUpdate ? "FOR UPDATE" : "";
      const { rows } = await client.query(
        `
          SELECT
            reset_token_id,
            user_id,
            token_digest,
            expires_at,
            consumed_at,
            created_at
          FROM auth_password_reset_tokens
          WHERE token_digest = $1
          LIMIT 1
          ${lockClause}
        `,
        [tokenDigest]
      );
      return mapResetToken(rows[0]);
    },

    async consumeResetToken(client, resetTokenId, consumedAt) {
      const { rows } = await client.query(
        `
          UPDATE auth_password_reset_tokens
          SET consumed_at = $2
          WHERE reset_token_id = $1
            AND consumed_at IS NULL
          RETURNING
            reset_token_id,
            user_id,
            token_digest,
            expires_at,
            consumed_at,
            created_at
        `,
        [resetTokenId, consumedAt]
      );
      return mapResetToken(rows[0]);
    },

    withTransaction
  };
}
