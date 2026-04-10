import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import pg from "pg";

import { ensureSchema } from "./schema.js";

const { Pool } = pg;

const config = {
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10)
};

const now = Date.now();

function isoOffset({ days = 0, hours = 0, minutes = 0 } = {}) {
  return new Date(
    now + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000
  ).toISOString();
}

function tokenDigest(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function describeDatabaseTarget(connectionString) {
  try {
    const url = new URL(connectionString);
    return `${url.hostname}:${url.port || "5432"}${url.pathname}`;
  } catch {
    return "custom DATABASE_URL";
  }
}

// Fixed ids keep the seed re-runnable without multiplying demo rows.
const demoUsers = [
  {
    key: "admin",
    userId: "00000000-0000-4000-8000-000000000101",
    email: "admin.demo@evenements.local",
    password: "Admin!2026",
    displayName: "Amina Admin",
    role: "ADMIN",
    accountStatus: "ACTIVE",
    createdAt: isoOffset({ days: -45 }),
    updatedAt: isoOffset({ days: -1 }),
    lastLoginAt: isoOffset({ hours: -4 })
  },
  {
    key: "organizer-1",
    userId: "00000000-0000-4000-8000-000000000102",
    email: "kenza.organizer@evenements.local",
    password: "Organizer!2026",
    displayName: "Kenza Organizer",
    role: "ORGANIZER",
    accountStatus: "ACTIVE",
    createdAt: isoOffset({ days: -30 }),
    updatedAt: isoOffset({ days: -1 }),
    lastLoginAt: isoOffset({ hours: -8 })
  },
  {
    key: "organizer-2",
    userId: "00000000-0000-4000-8000-000000000103",
    email: "yanis.organizer@evenements.local",
    password: "Organizer!2026",
    displayName: "Yanis Organizer",
    role: "ORGANIZER",
    accountStatus: "ACTIVE",
    createdAt: isoOffset({ days: -18 }),
    updatedAt: isoOffset({ days: -2 }),
    lastLoginAt: isoOffset({ hours: -18 })
  },
  {
    key: "participant-1",
    userId: "00000000-0000-4000-8000-000000000104",
    email: "leila.participant@evenements.local",
    password: "Participant!2026",
    displayName: "Leila Participant",
    role: "PARTICIPANT",
    accountStatus: "ACTIVE",
    createdAt: isoOffset({ days: -12 }),
    updatedAt: isoOffset({ days: -1 }),
    lastLoginAt: isoOffset({ hours: -11 })
  },
  {
    key: "participant-2",
    userId: "00000000-0000-4000-8000-000000000105",
    email: "amine.participant@evenements.local",
    password: "Participant!2026",
    displayName: "Amine Participant",
    role: "PARTICIPANT",
    accountStatus: "ACTIVE",
    createdAt: isoOffset({ days: -10 }),
    updatedAt: isoOffset({ days: -3 }),
    lastLoginAt: isoOffset({ hours: -26 })
  },
  {
    key: "participant-locked",
    userId: "00000000-0000-4000-8000-000000000106",
    email: "sara.locked@evenements.local",
    password: "Participant!2026",
    displayName: "Sara Locked",
    role: "PARTICIPANT",
    accountStatus: "LOCKED",
    createdAt: isoOffset({ days: -9 }),
    updatedAt: isoOffset({ hours: -30 }),
    lastLoginAt: isoOffset({ days: -4 })
  },
  {
    key: "participant-disabled",
    userId: "00000000-0000-4000-8000-000000000107",
    email: "nora.disabled@evenements.local",
    password: "Participant!2026",
    displayName: "Nora Disabled",
    role: "PARTICIPANT",
    accountStatus: "DISABLED",
    createdAt: isoOffset({ days: -7 }),
    updatedAt: isoOffset({ hours: -42 }),
    lastLoginAt: isoOffset({ days: -5 })
  }
];

const demoSessions = [
  {
    sessionId: "00000000-0000-4000-8000-000000000201",
    userKey: "admin",
    rawRefreshToken: "seed-refresh-admin-2026",
    expiresAt: isoOffset({ days: 7 }),
    revokedAt: null,
    createdAt: isoOffset({ days: -2 })
  },
  {
    sessionId: "00000000-0000-4000-8000-000000000202",
    userKey: "organizer-1",
    rawRefreshToken: "seed-refresh-kenza-2026",
    expiresAt: isoOffset({ days: 6 }),
    revokedAt: null,
    createdAt: isoOffset({ days: -1, hours: -5 })
  },
  {
    sessionId: "00000000-0000-4000-8000-000000000203",
    userKey: "participant-1",
    rawRefreshToken: "seed-refresh-leila-2026",
    expiresAt: isoOffset({ days: 5 }),
    revokedAt: null,
    createdAt: isoOffset({ days: -1, hours: -9 })
  },
  {
    sessionId: "00000000-0000-4000-8000-000000000204",
    userKey: "participant-disabled",
    rawRefreshToken: "seed-refresh-nora-2026",
    expiresAt: isoOffset({ days: -1 }),
    revokedAt: isoOffset({ hours: -12 }),
    createdAt: isoOffset({ days: -6 })
  }
];

const demoResetTokens = [
  {
    resetTokenId: "00000000-0000-4000-8000-000000000301",
    userKey: "organizer-1",
    rawResetToken: "seed-reset-kenza-2026",
    expiresAt: isoOffset({ hours: 8 }),
    consumedAt: null,
    createdAt: isoOffset({ minutes: -45 })
  },
  {
    resetTokenId: "00000000-0000-4000-8000-000000000302",
    userKey: "participant-2",
    rawResetToken: "seed-reset-amine-expired-2026",
    expiresAt: isoOffset({ days: -1 }),
    consumedAt: null,
    createdAt: isoOffset({ days: -2 })
  },
  {
    resetTokenId: "00000000-0000-4000-8000-000000000303",
    userKey: "participant-1",
    rawResetToken: "seed-reset-leila-used-2026",
    expiresAt: isoOffset({ days: 1 }),
    consumedAt: isoOffset({ hours: -2 }),
    createdAt: isoOffset({ hours: -5 })
  }
];

const demoAuditLogs = [
  {
    auditId: "00000000-0000-4000-8000-000000000401",
    occurredAt: isoOffset({ hours: -4 }),
    sourceService: "identity-access-service",
    actorKey: "admin",
    actorRole: "ADMIN",
    action: "USER_LOGIN_SUCCEEDED",
    targetType: "USER",
    targetKey: "admin",
    result: "SUCCESS",
    correlationId: "seed-correlation-admin-login",
    reasonCode: null,
    reasonNote: null,
    metadata: {
      sessionId: "00000000-0000-4000-8000-000000000201",
      seed: true
    },
    ipAddress: "127.0.0.1",
    userAgent: "seed-script/1.0"
  },
  {
    auditId: "00000000-0000-4000-8000-000000000402",
    occurredAt: isoOffset({ hours: -8 }),
    sourceService: "identity-access-service",
    actorKey: "organizer-1",
    actorRole: "ORGANIZER",
    action: "USER_LOGIN_SUCCEEDED",
    targetType: "USER",
    targetKey: "organizer-1",
    result: "SUCCESS",
    correlationId: "seed-correlation-kenza-login",
    reasonCode: null,
    reasonNote: null,
    metadata: {
      sessionId: "00000000-0000-4000-8000-000000000202",
      seed: true
    },
    ipAddress: "127.0.0.1",
    userAgent: "seed-script/1.0"
  },
  {
    auditId: "00000000-0000-4000-8000-000000000403",
    occurredAt: isoOffset({ hours: -3 }),
    sourceService: "identity-access-service",
    actorKey: "participant-locked",
    actorRole: "PARTICIPANT",
    action: "USER_LOGIN_FAILED",
    targetType: "USER",
    targetKey: "participant-locked",
    result: "DENIED",
    correlationId: "seed-correlation-sara-locked",
    reasonCode: "ACCOUNT_LOCKED",
    reasonNote: "Locked demo account rejected on login.",
    metadata: {
      accountStatus: "LOCKED",
      seed: true
    },
    ipAddress: "127.0.0.1",
    userAgent: "seed-script/1.0"
  },
  {
    auditId: "00000000-0000-4000-8000-000000000404",
    occurredAt: isoOffset({ minutes: -45 }),
    sourceService: "identity-access-service",
    actorKey: "organizer-1",
    actorRole: "ORGANIZER",
    action: "USER_PASSWORD_RESET_REQUESTED",
    targetType: "USER",
    targetKey: "organizer-1",
    result: "SUCCESS",
    correlationId: "seed-correlation-kenza-reset-request",
    reasonCode: null,
    reasonNote: null,
    metadata: {
      userFound: true,
      seed: true
    },
    ipAddress: "127.0.0.1",
    userAgent: "seed-script/1.0"
  },
  {
    auditId: "00000000-0000-4000-8000-000000000405",
    occurredAt: isoOffset({ hours: -2 }),
    sourceService: "identity-access-service",
    actorKey: "participant-2",
    actorRole: "PARTICIPANT",
    action: "USER_PASSWORD_RESET_FAILED",
    targetType: "PASSWORD_RESET_TOKEN",
    targetId: "00000000-0000-4000-8000-000000000302",
    result: "FAILURE",
    correlationId: "seed-correlation-amine-reset-expired",
    reasonCode: "RESET_TOKEN_EXPIRED",
    reasonNote: "Expired demo reset token.",
    metadata: {
      seed: true
    },
    ipAddress: "127.0.0.1",
    userAgent: "seed-script/1.0"
  }
];

async function upsertUser(client, user) {
  const passwordHash = await bcrypt.hash(user.password, config.bcryptSaltRounds);
  const { rows } = await client.query(
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
      ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          display_name = EXCLUDED.display_name,
          role = EXCLUDED.role,
          account_status = EXCLUDED.account_status,
          updated_at = EXCLUDED.updated_at,
          last_login_at = EXCLUDED.last_login_at
      RETURNING user_id, email, role, account_status
    `,
    [
      user.userId,
      user.email,
      passwordHash,
      user.displayName,
      user.role,
      user.accountStatus,
      user.createdAt,
      user.updatedAt,
      user.lastLoginAt
    ]
  );
  return rows[0];
}

async function upsertSession(client, session, userId) {
  await client.query(
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
      ON CONFLICT (session_id) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          refresh_token_digest = EXCLUDED.refresh_token_digest,
          expires_at = EXCLUDED.expires_at,
          revoked_at = EXCLUDED.revoked_at,
          created_at = EXCLUDED.created_at
    `,
    [
      session.sessionId,
      userId,
      tokenDigest(session.rawRefreshToken),
      session.expiresAt,
      session.revokedAt,
      session.createdAt
    ]
  );
}

async function upsertResetToken(client, resetToken, userId) {
  await client.query(
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
      ON CONFLICT (token_digest) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          expires_at = EXCLUDED.expires_at,
          consumed_at = EXCLUDED.consumed_at,
          created_at = EXCLUDED.created_at
    `,
    [
      resetToken.resetTokenId,
      userId,
      tokenDigest(resetToken.rawResetToken),
      resetToken.expiresAt,
      resetToken.consumedAt,
      resetToken.createdAt
    ]
  );
}

function resolveAuditTargetId(entry, usersByKey) {
  if (entry.targetId) {
    return entry.targetId;
  }
  if (entry.targetKey) {
    return usersByKey.get(entry.targetKey);
  }
  return usersByKey.get(entry.actorKey);
}

async function upsertAuditLog(client, entry, usersByKey) {
  const actorId = usersByKey.get(entry.actorKey);
  const targetId = resolveAuditTargetId(entry, usersByKey);

  await client.query(
    `
      INSERT INTO auth_security_audit_logs (
        audit_id,
        occurred_at,
        source_service,
        actor_id,
        actor_role,
        action,
        target_type,
        target_id,
        result,
        correlation_id,
        reason_code,
        reason_note,
        metadata,
        ip_address,
        user_agent
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      )
      ON CONFLICT (audit_id) DO UPDATE
      SET occurred_at = EXCLUDED.occurred_at,
          source_service = EXCLUDED.source_service,
          actor_id = EXCLUDED.actor_id,
          actor_role = EXCLUDED.actor_role,
          action = EXCLUDED.action,
          target_type = EXCLUDED.target_type,
          target_id = EXCLUDED.target_id,
          result = EXCLUDED.result,
          correlation_id = EXCLUDED.correlation_id,
          reason_code = EXCLUDED.reason_code,
          reason_note = EXCLUDED.reason_note,
          metadata = EXCLUDED.metadata,
          ip_address = EXCLUDED.ip_address,
          user_agent = EXCLUDED.user_agent
    `,
    [
      entry.auditId,
      entry.occurredAt,
      entry.sourceService,
      actorId,
      entry.actorRole,
      entry.action,
      entry.targetType,
      targetId,
      entry.result,
      entry.correlationId,
      entry.reasonCode,
      entry.reasonNote,
      JSON.stringify(entry.metadata || {}),
      entry.ipAddress,
      entry.userAgent
    ]
  );
}

async function fetchCounts(pool) {
  const { rows } = await pool.query(`
    SELECT 'auth_users' AS table_name, count(*)::int AS count FROM auth_users
    UNION ALL
    SELECT 'auth_sessions' AS table_name, count(*)::int AS count FROM auth_sessions
    UNION ALL
    SELECT 'auth_password_reset_tokens' AS table_name, count(*)::int AS count FROM auth_password_reset_tokens
    UNION ALL
    SELECT 'auth_security_audit_logs' AS table_name, count(*)::int AS count FROM auth_security_audit_logs
    ORDER BY table_name
  `);
  return rows;
}

async function main() {
  const pool = new Pool({
    connectionString: config.databaseUrl
  });

  try {
    await ensureSchema(pool);

    const usersByKey = new Map();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const user of demoUsers) {
        const stored = await upsertUser(client, user);
        usersByKey.set(user.key, stored.user_id);
      }

      for (const session of demoSessions) {
        await upsertSession(client, session, usersByKey.get(session.userKey));
      }

      for (const resetToken of demoResetTokens) {
        await upsertResetToken(client, resetToken, usersByKey.get(resetToken.userKey));
      }

      for (const auditLog of demoAuditLogs) {
        await upsertAuditLog(client, auditLog, usersByKey);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const counts = await fetchCounts(pool);

    console.log("Identity seed completed.");
    console.log(`Database target: ${describeDatabaseTarget(config.databaseUrl)}`);
    console.log("Demo credentials:");
    for (const user of demoUsers) {
      console.log(
        `- ${user.email} | ${user.password} | ${user.role} | ${user.accountStatus}`
      );
    }
    console.log("Demo reset tokens:");
    for (const resetToken of demoResetTokens) {
      const user = demoUsers.find((entry) => entry.key === resetToken.userKey);
      console.log(`- ${user.email} | ${resetToken.rawResetToken}`);
    }
    console.log("Row counts:");
    for (const row of counts) {
      console.log(`- ${row.table_name}: ${row.count}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Identity seed failed.");
  console.error(error);
  process.exit(1);
});
