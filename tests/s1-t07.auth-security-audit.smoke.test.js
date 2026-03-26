import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const identityCwd = path.join(repoRoot, "services/identity-access-service");

const identityPort = 4107;
const postgresPort = 55438;
const postgresContainerName = `evenements_s1_t07_pg_${Date.now()}`;
const postgresDb = "evenements_s1_t07";
const postgresUser = "postgres";
const postgresPassword = "postgres";
const postgresImage = "postgres:18";
const useExternalPostgres = process.env.S1_T07_USE_EXTERNAL_POSTGRES === "true";
const databaseUrl =
  process.env.S1_T07_DATABASE_URL ||
  `postgres://${postgresUser}:${postgresPassword}@127.0.0.1:${postgresPort}/${postgresDb}`;

const sharedEnv = {
  JWT_ACCESS_SECRET: "s1-t07-access-secret",
  JWT_REFRESH_SECRET: "s1-t07-refresh-secret"
};

const workspaceQueryScript = `
  import pg from "pg";

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const query = JSON.parse(process.env.IDENTITY_TEST_QUERY);
  const params = JSON.parse(process.env.IDENTITY_TEST_PARAMS || "[]");
  const { rows } = await pool.query(query, params);
  process.stdout.write(JSON.stringify(rows));
  await pool.end();
`;

function startService(cwd, env) {
  return spawn("node", ["src/index.js"], {
    cwd,
    env: { ...process.env, ...env },
    stdio: "pipe"
  });
}

function runDocker(args) {
  return new Promise((resolve, reject) => {
    const processRef = spawn("docker", args, {
      cwd: repoRoot,
      stdio: "pipe"
    });

    let stdout = "";
    let stderr = "";

    processRef.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    processRef.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    processRef.on("error", reject);
    processRef.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        return;
      }
      reject(new Error(`docker ${args.join(" ")} failed: ${stderr || stdout}`));
    });
  });
}

function runWorkspaceQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    const processRef = spawn(
      "corepack",
      [
        "pnpm",
        "--filter",
        "identity-access-service",
        "exec",
        "node",
        "--input-type=module",
        "-e",
        workspaceQueryScript
      ],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          IDENTITY_TEST_QUERY: JSON.stringify(query),
          IDENTITY_TEST_PARAMS: JSON.stringify(params)
        },
        stdio: "pipe"
      }
    );

    let stdout = "";
    let stderr = "";

    processRef.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    processRef.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    processRef.on("error", reject);
    processRef.on("exit", (code) => {
      if (code === 0) {
        try {
          resolve(stdout.trim() ? JSON.parse(stdout) : []);
        } catch (err) {
          reject(err);
        }
        return;
      }
      reject(new Error(stderr || stdout || "workspace query failed"));
    });
  });
}

async function startPostgresContainer() {
  await runDocker(["rm", "-f", postgresContainerName]).catch(() => {});
  await runDocker([
    "run",
    "--rm",
    "--name",
    postgresContainerName,
    "-e",
    `POSTGRES_USER=${postgresUser}`,
    "-e",
    `POSTGRES_PASSWORD=${postgresPassword}`,
    "-e",
    `POSTGRES_DB=${postgresDb}`,
    "-p",
    `${postgresPort}:5432`,
    "-d",
    postgresImage
  ]);
}

async function waitForPostgresReady(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const check = await runDocker([
        "exec",
        postgresContainerName,
        "pg_isready",
        "-U",
        postgresUser,
        "-d",
        postgresDb
      ]);
      if (check.stdout.includes("accepting connections")) {
        return;
      }
    } catch {
      // postgres is still booting
    }
    await delay(300);
  }
  throw new Error("Postgres container did not become ready in time");
}

async function waitForReady(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // ignored on purpose while booting
    }
    await delay(150);
  }
  throw new Error(`Service not ready: ${url}`);
}

async function jsonFetch(url, options = {}) {
  const headers = {
    "content-type": "application/json",
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  return { res, body };
}

function assertCorrelationHeader(response, expected = null) {
  const correlationId = response.headers.get("x-correlation-id");
  assert.ok(correlationId, "x-correlation-id header must be present");
  if (expected) {
    assert.equal(correlationId, expected);
  }
}

function findAuditByCorrelation(audits, correlationId) {
  return audits.find((audit) => audit.correlation_id === correlationId) || null;
}

let identityProcess;
let userId = "";
let email = "audit-organizer@example.com";
let password = "InitialPwd#1";
let resetToken = "";

test("boot identity service for S1-T07", async () => {
  if (!useExternalPostgres) {
    await startPostgresContainer();
    await waitForPostgresReady();
  }

  identityProcess = startService(identityCwd, {
    ...sharedEnv,
    PORT: String(identityPort),
    DEBUG_EXPOSE_RESET_TOKEN: "true",
    DATABASE_URL: databaseUrl
  });

  await waitForReady(`http://127.0.0.1:${identityPort}/ready`);
  assert.ok(true);
});

test("auth flows persist security audits", async () => {
  const register = await jsonFetch(`http://127.0.0.1:${identityPort}/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      displayName: "Audit Organizer",
      role: "ORGANIZER"
    })
  });

  assert.equal(register.res.status, 201);
  userId = register.body.data.userId;

  const loginSuccessCorrelation = "audit-login-success";
  const loginSuccess = await jsonFetch(`http://127.0.0.1:${identityPort}/auth/login`, {
    method: "POST",
    headers: {
      "x-correlation-id": loginSuccessCorrelation
    },
    body: JSON.stringify({
      email,
      password
    })
  });
  assert.equal(loginSuccess.res.status, 200);
  assertCorrelationHeader(loginSuccess.res, loginSuccessCorrelation);

  const loginFailureCorrelation = "audit-login-failure";
  const loginFailure = await jsonFetch(`http://127.0.0.1:${identityPort}/auth/login`, {
    method: "POST",
    headers: {
      "x-correlation-id": loginFailureCorrelation
    },
    body: JSON.stringify({
      email,
      password: "WrongPwd#9"
    })
  });
  assert.equal(loginFailure.res.status, 401);
  assertCorrelationHeader(loginFailure.res, loginFailureCorrelation);

  const resetRequestCorrelation = "audit-reset-request";
  const forgot = await jsonFetch(`http://127.0.0.1:${identityPort}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "x-correlation-id": resetRequestCorrelation
    },
    body: JSON.stringify({
      email
    })
  });
  assert.equal(forgot.res.status, 202);
  assertCorrelationHeader(forgot.res, resetRequestCorrelation);
  resetToken = forgot.body.meta?.debugResetToken;
  assert.ok(resetToken);

  const resetInvalidCorrelation = "audit-reset-invalid";
  const resetInvalid = await jsonFetch(
    `http://127.0.0.1:${identityPort}/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "x-correlation-id": resetInvalidCorrelation
      },
      body: JSON.stringify({
        token: "invalid-reset-token",
        newPassword: "UpdatedPwd#2"
      })
    }
  );
  assert.equal(resetInvalid.res.status, 401);
  assertCorrelationHeader(resetInvalid.res, resetInvalidCorrelation);

  password = "UpdatedPwd#2";
  const resetSuccessCorrelation = "audit-reset-success";
  const resetSuccess = await jsonFetch(
    `http://127.0.0.1:${identityPort}/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "x-correlation-id": resetSuccessCorrelation
      },
      body: JSON.stringify({
        token: resetToken,
        newPassword: password
      })
    }
  );
  assert.equal(resetSuccess.res.status, 200);
  assertCorrelationHeader(resetSuccess.res, resetSuccessCorrelation);

  await runWorkspaceQuery(
    `
      UPDATE auth_users
      SET account_status = 'LOCKED',
          updated_at = NOW()
      WHERE user_id = $1
    `,
    [userId]
  );

  const loginLockedCorrelation = "audit-login-locked";
  const lockedLogin = await jsonFetch(`http://127.0.0.1:${identityPort}/auth/login`, {
    method: "POST",
    headers: {
      "x-correlation-id": loginLockedCorrelation
    },
    body: JSON.stringify({
      email,
      password
    })
  });
  assert.equal(lockedLogin.res.status, 401);
  assert.equal(lockedLogin.body.code, "ACCOUNT_LOCKED");
  assertCorrelationHeader(lockedLogin.res, loginLockedCorrelation);

  const audits = await runWorkspaceQuery(`
    SELECT
      action,
      result,
      target_type,
      target_id,
      actor_id,
      actor_role,
      reason_code,
      correlation_id
    FROM auth_security_audit_logs
    ORDER BY occurred_at ASC
  `);

  const successAudit = findAuditByCorrelation(audits, loginSuccessCorrelation);
  assert.ok(successAudit);
  assert.equal(successAudit.action, "USER_LOGIN_SUCCEEDED");
  assert.equal(successAudit.result, "SUCCESS");
  assert.equal(successAudit.target_id, userId);
  assert.equal(successAudit.actor_id, userId);
  assert.equal(successAudit.actor_role, "ORGANIZER");

  const failedAudit = findAuditByCorrelation(audits, loginFailureCorrelation);
  assert.ok(failedAudit);
  assert.equal(failedAudit.action, "USER_LOGIN_FAILED");
  assert.equal(failedAudit.result, "FAILURE");
  assert.equal(failedAudit.reason_code, "INVALID_CREDENTIALS");
  assert.equal(failedAudit.target_id, userId);

  const requestAudit = findAuditByCorrelation(audits, resetRequestCorrelation);
  assert.ok(requestAudit);
  assert.equal(requestAudit.action, "USER_PASSWORD_RESET_REQUESTED");
  assert.equal(requestAudit.result, "SUCCESS");
  assert.equal(requestAudit.target_id, userId);

  const invalidResetAudit = findAuditByCorrelation(audits, resetInvalidCorrelation);
  assert.ok(invalidResetAudit);
  assert.equal(invalidResetAudit.action, "USER_PASSWORD_RESET_FAILED");
  assert.equal(invalidResetAudit.result, "FAILURE");
  assert.equal(invalidResetAudit.reason_code, "INVALID_RESET_TOKEN");
  assert.equal(invalidResetAudit.target_type, "PASSWORD_RESET_TOKEN");

  const resetSuccessAudit = findAuditByCorrelation(audits, resetSuccessCorrelation);
  assert.ok(resetSuccessAudit);
  assert.equal(resetSuccessAudit.action, "USER_PASSWORD_RESET_SUCCEEDED");
  assert.equal(resetSuccessAudit.result, "SUCCESS");
  assert.equal(resetSuccessAudit.target_id, userId);

  const lockedAudit = findAuditByCorrelation(audits, loginLockedCorrelation);
  assert.ok(lockedAudit);
  assert.equal(lockedAudit.action, "USER_LOGIN_FAILED");
  assert.equal(lockedAudit.result, "DENIED");
  assert.equal(lockedAudit.reason_code, "ACCOUNT_LOCKED");
  assert.equal(lockedAudit.target_id, userId);
});

test("shutdown identity service", async () => {
  if (identityProcess && !identityProcess.killed) {
    identityProcess.kill("SIGTERM");
  }
  if (!useExternalPostgres) {
    await runDocker(["rm", "-f", postgresContainerName]).catch(() => {});
  }
  await delay(100);
  assert.ok(true);
});
