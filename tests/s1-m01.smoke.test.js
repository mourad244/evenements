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
const gatewayCwd = path.join(repoRoot, "services/api-gateway");

const identityPort = 4101;
const gatewayPort = 4100;
const postgresPort = 55432;
const postgresContainerName = `evenements_s1_m01_pg_${Date.now()}`;
const postgresDb = "evenements_s1_m01";
const postgresUser = "postgres";
const postgresPassword = "postgres";
const postgresImage = "postgres:18";
const useExternalPostgres = process.env.S1_M01_USE_EXTERNAL_POSTGRES === "true";
const databaseUrl =
  process.env.S1_M01_DATABASE_URL ||
  `postgres://${postgresUser}:${postgresPassword}@127.0.0.1:${postgresPort}/${postgresDb}`;

const sharedEnv = {
  JWT_ACCESS_SECRET: "s1-m01-access-secret",
  JWT_REFRESH_SECRET: "s1-m01-refresh-secret"
};

function startService(cwd, env) {
  const processRef = spawn("node", ["src/index.js"], {
    cwd,
    env: { ...process.env, ...env },
    stdio: "pipe"
  });
  return processRef;
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

    processRef.on("error", (err) => {
      reject(err);
    });

    processRef.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        return;
      }
      reject(new Error(`docker ${args.join(" ")} failed: ${stderr || stdout}`));
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

let identityProcess;
let gatewayProcess;

let organizerEmail = "organizer@example.com";
let organizerPassword = "InitialPwd#1";
let organizerAccessToken = "";
let organizerRefreshToken = "";
let organizerUserId = "";
let organizerSessionId = "";

let participantAccessToken = "";

test("boot services for S1-M01", async () => {
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

  gatewayProcess = startService(gatewayCwd, {
    ...sharedEnv,
    PORT: String(gatewayPort),
    IDENTITY_SERVICE_URL: `http://127.0.0.1:${identityPort}`
  });

  await waitForReady(`http://127.0.0.1:${identityPort}/ready`);
  // S1-M01 only boots identity + gateway, so use gateway /health here.
  await waitForReady(`http://127.0.0.1:${gatewayPort}/health`);

  assert.ok(true);
});

test("register + login organizer through gateway", async () => {
  const register = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email: organizerEmail,
      password: organizerPassword,
      displayName: "Organizer User",
      role: "ORGANIZER"
    })
  });

  assert.equal(register.res.status, 201);
  assert.equal(register.body.success, true);
  assertCorrelationHeader(register.res);
  organizerUserId = register.body.data.userId;

  const login = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email: organizerEmail,
      password: organizerPassword
    })
  });

  assert.equal(login.res.status, 200);
  assert.equal(login.body.success, true);
  assertCorrelationHeader(login.res);
  organizerAccessToken = login.body.data.accessToken;
  organizerRefreshToken = login.body.data.refreshToken;
  organizerSessionId = login.body.data.sessionId;
  assert.ok(organizerAccessToken);
  assert.ok(organizerRefreshToken);
});

test("gateway propagates auth context and correlation id", async () => {
  const correlationId = "smk-s1-m01-correlation";
  const me = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/auth/me`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`,
      "x-correlation-id": correlationId
    }
  });

  assert.equal(me.res.status, 200);
  assert.equal(me.body.success, true);
  assertCorrelationHeader(me.res, correlationId);
  assert.equal(me.body.data.context.userId, organizerUserId);
  assert.equal(me.body.data.context.sessionId, organizerSessionId);
  assert.equal(me.body.data.context.role, "ORGANIZER");
  assert.equal(me.body.data.context.correlationId, correlationId);
});

test("refresh token flow works", async () => {
  const refresh = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/auth/refresh`, {
    method: "POST",
    body: JSON.stringify({
      refreshToken: organizerRefreshToken
    })
  });

  assert.equal(refresh.res.status, 200);
  assert.equal(refresh.body.success, true);
  assertCorrelationHeader(refresh.res);
  assert.ok(refresh.body.data.accessToken);
  assert.ok(refresh.body.data.refreshToken);
});

test("forgot + reset password flow works", async () => {
  const forgot = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/auth/forgot-password`,
    {
      method: "POST",
      body: JSON.stringify({
        email: organizerEmail
      })
    }
  );

  assert.equal(forgot.res.status, 202);
  assert.equal(forgot.body.success, true);
  assertCorrelationHeader(forgot.res);
  const debugResetToken = forgot.body.meta?.debugResetToken;
  assert.ok(debugResetToken);

  const newPassword = "NewStrongPwd#2";
  const reset = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify({
      token: debugResetToken,
      newPassword
    })
  });
  assert.equal(reset.res.status, 200);
  assert.equal(reset.body.success, true);
  assertCorrelationHeader(reset.res);

  const oldLogin = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email: organizerEmail,
      password: organizerPassword
    })
  });
  assert.equal(oldLogin.res.status, 401);
  assertCorrelationHeader(oldLogin.res);

  const newLogin = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email: organizerEmail,
      password: newPassword
    })
  });
  assert.equal(newLogin.res.status, 200);
  assertCorrelationHeader(newLogin.res);

  organizerPassword = newPassword;
  organizerAccessToken = newLogin.body.data.accessToken;
});

test("gateway returns 401 on missing bearer token for protected route", async () => {
  const unauthenticated = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/auth/me`, {
    method: "GET"
  });
  assert.equal(unauthenticated.res.status, 401);
  assert.equal(unauthenticated.body.code, "UNAUTHORIZED");
  assertCorrelationHeader(unauthenticated.res);
});

test("gateway returns 403 on role mismatch", async () => {
  const participantEmail = "participant@example.com";
  const participantPassword = "ParticipantPwd#1";

  const registerParticipant = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/auth/register`,
    {
      method: "POST",
      body: JSON.stringify({
        email: participantEmail,
        password: participantPassword,
        displayName: "Participant User",
        role: "PARTICIPANT"
      })
    }
  );
  assert.equal(registerParticipant.res.status, 201);
  assertCorrelationHeader(registerParticipant.res);

  const loginParticipant = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/auth/login`,
    {
      method: "POST",
      body: JSON.stringify({
        email: participantEmail,
        password: participantPassword
      })
    }
  );
  assert.equal(loginParticipant.res.status, 200);
  assertCorrelationHeader(loginParticipant.res);
  participantAccessToken = loginParticipant.body.data.accessToken;

  const forbidden = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/organizer/ping`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    }
  });

  assert.equal(forbidden.res.status, 403);
  assert.equal(forbidden.body.code, "FORBIDDEN");
  assertCorrelationHeader(forbidden.res);

  const organizerAllowed = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/organizer/ping`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${organizerAccessToken}`
      }
    }
  );
  assert.equal(organizerAllowed.res.status, 200);
  assert.equal(organizerAllowed.body.success, true);
  assertCorrelationHeader(organizerAllowed.res);
});

test("shutdown services", async () => {
  if (gatewayProcess && !gatewayProcess.killed) {
    gatewayProcess.kill("SIGTERM");
  }
  if (identityProcess && !identityProcess.killed) {
    identityProcess.kill("SIGTERM");
  }
  if (!useExternalPostgres) {
    await runDocker(["rm", "-f", postgresContainerName]).catch(() => {});
  }
  await delay(100);
  assert.ok(true);
});
