import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

import bcrypt from "bcryptjs";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import pg from "pg";
import {
  createCorrelationIdMiddleware,
  createJsonLogger,
  createRequestCompletionLogger
} from "../../shared/observability.js";

import { runMigrations } from "./db/schema.js";
import {
  identityAuthLogFields,
  isIdentityAuthPath
} from "./observabilityConfig.js";
import { createAuthRepository } from "./repositories/authRepository.js";
import { sendPasswordResetEmail } from "./email.js";

const { Pool } = pg;

const config = {
  serviceName: "identity-access-service",
  port: Number(process.env.PORT || 4001),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01",
  dbAutoMigrate: process.env.DB_AUTO_MIGRATE !== "false",
  accessTokenTtlSec: Number(process.env.ACCESS_TOKEN_TTL_SEC || 900),
  refreshTokenTtlSec: Number(process.env.REFRESH_TOKEN_TTL_SEC || 604800),
  resetTokenTtlSec: Number(process.env.RESET_TOKEN_TTL_SEC || 900),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  exposeDebugResetToken: process.env.DEBUG_EXPOSE_RESET_TOKEN === "true"
};
const log = createJsonLogger(config.serviceName);

function resolveJwtSecret(envKey, fallbackValue) {
  const configured = String(process.env[envKey] || "").trim();
  if (configured) {
    if (configured.length < 32) {
      log("warn", "auth.jwt.secret.weak", {
        envKey,
        length: configured.length
      });
    }
    return configured;
  }

  if (process.env.ALLOW_INSECURE_JWT_DEFAULTS === "true") {
    log("warn", "auth.jwt.secret.insecure_default", {
      envKey,
      message: "Using insecure default secret; set env to harden."
    });
    return fallbackValue;
  }

  throw new Error(`FATAL: ${envKey} is required. Set ALLOW_INSECURE_JWT_DEFAULTS=true to bypass.`);
}

config.jwtAccessSecret = resolveJwtSecret(
  "JWT_ACCESS_SECRET",
  "dev-insecure-access-secret"
);
config.jwtRefreshSecret = resolveJwtSecret(
  "JWT_REFRESH_SECRET",
  "dev-insecure-refresh-secret"
);

const allowedSelfServiceRoles = new Set(["PARTICIPANT", "ORGANIZER"]);
const activeAccountStatuses = new Set(["ACTIVE"]);

const pool = new Pool({
  connectionString: config.databaseUrl
});
const repository = createAuthRepository(pool);

const app = express();
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

function success(data, meta) {
  if (meta) {
    return { success: true, data, meta };
  }
  return { success: true, data };
}

function error(errorMessage, code, details) {
  const payload = { success: false, error: errorMessage };
  if (code) payload.code = code;
  if (details) payload.details = details;
  return payload;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function nowIso() {
  return new Date().toISOString();
}

function toUserView(user) {
  const resolvedFullName = user.fullName || user.displayName || null;
  const resolvedDisplayName = user.displayName || user.fullName || null;
  const resolvedName = resolvedDisplayName || resolvedFullName || user.email;
  return {
    id: user.userId,
    userId: user.userId,
    email: user.email,
    name: resolvedName,
    fullName: resolvedFullName,
    displayName: resolvedDisplayName,
    role: user.role,
    accountStatus: user.accountStatus,
    phone: user.phone || null,
    city: user.city || null,
    bio: user.bio || null,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    lastLoginAt: user.lastLoginAt || null
  };
}

function signAccessToken(user, sessionId) {
  return jwt.sign(
    {
      sub: user.userId,
      sid: sessionId,
      email: user.email,
      name: user.displayName,
      role: user.role,
      account_status: user.accountStatus
    },
    config.jwtAccessSecret,
    { expiresIn: config.accessTokenTtlSec }
  );
}

function signRefreshToken(userId, sessionId) {
  return jwt.sign(
    {
      sub: userId,
      sid: sessionId,
      typ: "refresh"
    },
    config.jwtRefreshSecret,
    { expiresIn: config.refreshTokenTtlSec }
  );
}

function tokenDigest(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hasExpired(value) {
  return Date.now() >= new Date(value).getTime();
}

app.use(createCorrelationIdMiddleware());
app.use(
  createRequestCompletionLogger({
    log,
    eventName: "identity.auth.request.completed",
    isObserved: isIdentityAuthPath,
    buildFields: identityAuthLogFields
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json(
    success({
      status: "ok",
      service: config.serviceName
    })
  );
});

app.get("/ready", async (_req, res) => {
  try {
    await repository.checkConnection();
    return res.status(200).json(
      success({
        status: "ready",
        service: config.serviceName
      })
    );
  } catch {
    return res.status(503).json(error("Service not ready", "DB_UNAVAILABLE"));
  }
});

app.post("/auth/register", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const displayName = String(req.body?.displayName || "").trim();
  const role = String(req.body?.role || "").trim().toUpperCase();

  const details = [];
  if (!email) details.push("email is required");
  if (!password) details.push("password is required");
  if (!displayName) details.push("displayName is required");
  if (!role) details.push("role is required");
  if (role && !allowedSelfServiceRoles.has(role)) {
    details.push("role must be PARTICIPANT or ORGANIZER");
  }
  if (details.length > 0) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", details));
  }

  const existing = await repository.findUserByEmail(email);
  if (existing) {
    return res
      .status(409)
      .json(error("Email already exists", "EMAIL_ALREADY_EXISTS"));
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
  const user = await repository.createUser({
    userId: randomUUID(),
    email,
    passwordHash,
    displayName,
    fullName: displayName,
    phone: null,
    city: null,
    bio: null,
    role,
    accountStatus: "ACTIVE",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    lastLoginAt: null
  });

  return res.status(201).json(
    success({
      ...toUserView(user),
      nextAction: "LOGIN"
    })
  );
});

app.post("/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "email and password are required"
      ]));
  }

  const user = await repository.findUserByEmail(email);
  if (!user) {
    return res
      .status(401)
      .json(error("Invalid credentials", "INVALID_CREDENTIALS"));
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res
      .status(401)
      .json(error("Invalid credentials", "INVALID_CREDENTIALS"));
  }

  if (!activeAccountStatuses.has(user.accountStatus)) {
    const code =
      user.accountStatus === "LOCKED" ? "ACCOUNT_LOCKED" : "ACCOUNT_DISABLED";
    return res.status(401).json(error("Account is not active", code));
  }

  const sessionId = randomUUID();
  const refreshToken = signRefreshToken(user.userId, sessionId);
  await repository.createSession({
    sessionId,
    userId: user.userId,
    refreshTokenDigest: tokenDigest(refreshToken),
    expiresAt: new Date(Date.now() + config.refreshTokenTtlSec * 1000).toISOString(),
    revokedAt: null,
    createdAt: nowIso()
  });

  await repository.touchUserLogin(user.userId, nowIso());

  const accessToken = signAccessToken(user, sessionId);
  return res.status(200).json(
    success({
      accessToken,
      refreshToken,
      expiresIn: config.accessTokenTtlSec,
      sessionId,
      user: toUserView(user)
    })
  );
});

app.post("/auth/refresh", async (req, res) => {
  const refreshToken = String(req.body?.refreshToken || "");
  if (!refreshToken) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "refreshToken is required"
      ]));
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwtRefreshSecret);
  } catch {
    return res
      .status(401)
      .json(error("Invalid refresh token", "INVALID_REFRESH_TOKEN"));
  }

  if (payload.typ !== "refresh" || !payload.sid || !payload.sub) {
    return res
      .status(401)
      .json(error("Invalid refresh token", "INVALID_REFRESH_TOKEN"));
  }

  const session = await repository.findSessionById(payload.sid);
  if (!session || session.userId !== payload.sub || session.revokedAt) {
    return res
      .status(401)
      .json(error("Refresh token is not active", "INVALID_REFRESH_TOKEN"));
  }

  if (hasExpired(session.expiresAt)) {
    return res
      .status(401)
      .json(error("Refresh token expired", "REFRESH_TOKEN_EXPIRED"));
  }

  if (session.refreshTokenDigest !== tokenDigest(refreshToken)) {
    return res
      .status(401)
      .json(error("Invalid refresh token", "INVALID_REFRESH_TOKEN"));
  }

  const user = await repository.findUserById(session.userId);
  if (!user || !activeAccountStatuses.has(user.accountStatus)) {
    return res.status(401).json(error("Account is not active", "ACCOUNT_INVALID"));
  }

  const nextRefreshToken = signRefreshToken(user.userId, session.sessionId);
  await repository.updateSessionRefresh(
    session.sessionId,
    tokenDigest(nextRefreshToken),
    new Date(Date.now() + config.refreshTokenTtlSec * 1000).toISOString()
  );

  const accessToken = signAccessToken(user, session.sessionId);
  return res.status(200).json(
    success({
      accessToken,
      refreshToken: nextRefreshToken,
      expiresIn: config.accessTokenTtlSec,
      sessionId: session.sessionId,
      user: toUserView(user)
    })
  );
});

app.post("/auth/forgot-password", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "email is required"
      ]));
  }

  let debugResetToken = null;
  const user = await repository.findUserByEmail(email);
  if (user) {
    const rawResetToken = crypto.randomBytes(24).toString("hex");
    await repository.createResetToken({
      resetTokenId: randomUUID(),
      userId: user.userId,
      tokenDigest: tokenDigest(rawResetToken),
      expiresAt: new Date(Date.now() + config.resetTokenTtlSec * 1000).toISOString(),
      consumedAt: null,
      createdAt: nowIso()
    });
    debugResetToken = rawResetToken;

    // Send email asynchronously
    sendPasswordResetEmail(user.email, rawResetToken, log).catch(() => {
      // Errors are logged inside the email module
    });
  }

  const meta =
    config.exposeDebugResetToken && debugResetToken
      ? { debugResetToken }
      : undefined;

  return res.status(202).json(
    success(
      {
        message: "If the account exists, reset instructions have been sent."
      },
      meta
    )
  );
});

app.post("/auth/reset-password", async (req, res) => {
  const token = String(req.body?.token || "");
  const newPassword = String(req.body?.newPassword || "");

  if (!token || !newPassword) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "token and newPassword are required"
      ]));
  }

  const digest = tokenDigest(token);
  const nextPasswordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
  const consumedAt = nowIso();
  const updatedAt = consumedAt;

  try {
    const transactionResult = await repository.withTransaction(async (client) => {
      const resetToken = await repository.findResetTokenByDigest(client, digest, true);
      if (!resetToken) {
        return { kind: "INVALID" };
      }
      if (resetToken.consumedAt) {
        return { kind: "CONSUMED" };
      }
      if (hasExpired(resetToken.expiresAt)) {
        return { kind: "EXPIRED" };
      }

      const user = await repository.updateUserPassword(
        client,
        resetToken.userId,
        nextPasswordHash,
        updatedAt
      );
      if (!user) {
        return { kind: "USER_NOT_FOUND" };
      }

      await repository.revokeAllSessionsForUser(client, resetToken.userId, consumedAt);
      const consumedToken = await repository.consumeResetToken(
        client,
        resetToken.resetTokenId,
        consumedAt
      );
      if (!consumedToken) {
        return { kind: "CONSUMED" };
      }

      return { kind: "OK" };
    });

    if (transactionResult.kind === "INVALID") {
      return res
        .status(401)
        .json(error("Invalid reset token", "INVALID_RESET_TOKEN"));
    }
    if (transactionResult.kind === "EXPIRED") {
      return res
        .status(401)
        .json(error("Reset token expired", "RESET_TOKEN_EXPIRED"));
    }
    if (transactionResult.kind === "CONSUMED") {
      return res
        .status(422)
        .json(error("Reset token already used", "RESET_TOKEN_CONSUMED"));
    }
    if (transactionResult.kind === "USER_NOT_FOUND") {
      return res.status(404).json(error("User not found", "USER_NOT_FOUND"));
    }

    return res.status(200).json(
      success({
        message: "Password reset successful"
      })
    );
  } catch {
    return res
      .status(500)
      .json(error("Could not reset password", "RESET_FAILED"));
  }
});

app.get("/auth/me", async (req, res) => {
  const userId = req.header("x-user-id");
  const role = req.header("x-user-role");
  const sessionId = req.header("x-session-id");
  const correlationId = req.correlationId || null;

  if (!userId || !role || !sessionId) {
    return res
      .status(401)
      .json(error("Missing auth context", "MISSING_AUTH_CONTEXT"));
  }

  const session = await repository.findSessionById(sessionId);
  if (!session || session.userId !== userId || session.revokedAt) {
    return res
      .status(401)
      .json(error("Session is not active", "SESSION_INVALID"));
  }
  if (hasExpired(session.expiresAt)) {
    return res.status(401).json(error("Session expired", "SESSION_EXPIRED"));
  }

  const user = await repository.findUserById(userId);
  if (!user) {
    return res.status(404).json(error("User not found", "USER_NOT_FOUND"));
  }

  return res.status(200).json(
    success({
      user: toUserView(user),
      context: {
        userId,
        role,
        sessionId,
        correlationId: correlationId || null
      }
    })
  );
});

app.get("/profile", async (req, res) => {
  const userId = req.header("x-user-id");
  const role = req.header("x-user-role");
  const sessionId = req.header("x-session-id");

  if (!userId || !role || !sessionId) {
    return res
      .status(401)
      .json(error("Missing auth context", "MISSING_AUTH_CONTEXT"));
  }

  const session = await repository.findSessionById(sessionId);
  if (!session || session.userId !== userId || session.revokedAt) {
    return res
      .status(401)
      .json(error("Session is not active", "SESSION_INVALID"));
  }
  if (hasExpired(session.expiresAt)) {
    return res.status(401).json(error("Session expired", "SESSION_EXPIRED"));
  }

  const user = await repository.findUserById(userId);
  if (!user) {
    return res.status(404).json(error("User not found", "USER_NOT_FOUND"));
  }

  return res.status(200).json(
    success({
      user: toUserView(user)
    })
  );
});

app.patch("/profile", async (req, res) => {
  const userId = req.header("x-user-id");
  const role = req.header("x-user-role");
  const sessionId = req.header("x-session-id");

  if (!userId || !role || !sessionId) {
    return res
      .status(401)
      .json(error("Missing auth context", "MISSING_AUTH_CONTEXT"));
  }

  const session = await repository.findSessionById(sessionId);
  if (!session || session.userId !== userId || session.revokedAt) {
    return res
      .status(401)
      .json(error("Session is not active", "SESSION_INVALID"));
  }
  if (hasExpired(session.expiresAt)) {
    return res.status(401).json(error("Session expired", "SESSION_EXPIRED"));
  }

  const updates = {};
  const details = [];
  const body = req.body || {};

  if (Object.prototype.hasOwnProperty.call(body, "displayName")) {
    const value = String(body.displayName || "").trim();
    if (!value) {
      details.push("displayName cannot be empty");
    } else {
      updates.displayName = value;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "fullName")) {
    const value = String(body.fullName || "").trim();
    if (!value) {
      details.push("fullName cannot be empty");
    } else {
      updates.fullName = value;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "phone")) {
    const value =
      body.phone === null ? null : String(body.phone || "").trim();
    updates.phone = value || null;
  }

  if (Object.prototype.hasOwnProperty.call(body, "city")) {
    const value = body.city === null ? null : String(body.city || "").trim();
    updates.city = value || null;
  }

  if (Object.prototype.hasOwnProperty.call(body, "bio")) {
    const value = body.bio === null ? null : String(body.bio || "").trim();
    updates.bio = value || null;
  }

  if (details.length > 0) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", details));
  }

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json(error("No profile fields provided", "VALIDATION_ERROR"));
  }

  const user = await repository.updateUserProfile(userId, updates, nowIso());
  if (!user) {
    return res.status(404).json(error("User not found", "USER_NOT_FOUND"));
  }

  return res.status(200).json(
    success({
      user: toUserView(user)
    })
  );
});

app.get("/admin/users", async (req, res) => {
  const role = String(req.header("x-user-role") || "").trim().toUpperCase();
  const sessionId = String(req.header("x-session-id") || "").trim();
  const userId = String(req.header("x-user-id") || "").trim();

  if (!userId || !role || !sessionId) {
    return res
      .status(401)
      .json(error("Missing auth context", "MISSING_AUTH_CONTEXT"));
  }

  const session = await repository.findSessionById(sessionId);
  if (!session || session.userId !== userId || session.revokedAt) {
    return res
      .status(401)
      .json(error("Session is not active", "SESSION_INVALID"));
  }
  if (hasExpired(session.expiresAt)) {
    return res.status(401).json(error("Session expired", "SESSION_EXPIRED"));
  }

  if (role !== "ADMIN") {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 20;

  if (page < 1 || pageSize < 1 || pageSize > 100) {
    return res.status(400).json(error("Invalid pagination", "VALIDATION_ERROR"));
  }

  const result = await repository.listUsers({ page, pageSize });
  return res.status(200).json(
    success({
      items: result.items.map(toUserView),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    })
  );
});

app.use((_req, res) => {
  res.status(404).json(error("Route not found", "NOT_FOUND"));
});

async function boot() {
  const maxDbBootAttempts = 30;
  for (let attempt = 1; attempt <= maxDbBootAttempts; attempt += 1) {
    try {
      if (config.dbAutoMigrate) {
        await runMigrations(config.databaseUrl);
      } else {
        await repository.checkConnection();
      }
      break;
    } catch (err) {
      if (attempt === maxDbBootAttempts) {
        throw err;
      }
      await delay(500);
    }
  }

  app.listen(config.port, () => {
    log("info", "service.started", {
      port: config.port
    });
  });
}

boot().catch((err) => {
  log("error", "service.boot.failed", {
    message: err.message
  });
  process.exit(1);
});

async function shutdown() {
  await pool.end();
}

process.on("SIGTERM", () => {
  shutdown().finally(() => process.exit(0));
});

process.on("SIGINT", () => {
  shutdown().finally(() => process.exit(0));
});
