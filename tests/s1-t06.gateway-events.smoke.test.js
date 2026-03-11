import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const gatewayCwd = path.join(repoRoot, "services/api-gateway");
const eventServiceCwd = path.join(repoRoot, "services/event-management-service");

const gatewayPort = 4300;
const eventServicePort = 4302;
const postgresPort = 55434;
const postgresContainerName = `evenements_s1_t06_pg_${Date.now()}`;
const postgresDb = "evenements_s1_t06";
const postgresUser = "postgres";
const postgresPassword = "postgres";

const jwtAccessSecret = "s1-t06-access-secret";

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
    "postgres:18"
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
      if (check.stdout.includes("accepting connections")) return;
    } catch {
      // waiting for postgres to boot
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
      // waiting for service to boot
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

  const response = await fetch(url, {
    ...options,
    headers
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  return { response, body };
}

function signAccessToken({ userId, role, sessionId }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: userId,
    sid: sessionId,
    role,
    account_status: "ACTIVE",
    iat: now,
    exp: now + 900
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", jwtAccessSecret)
    .update(unsignedToken)
    .digest("base64url");
  return `${unsignedToken}.${signature}`;
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

const organizerContext = {
  userId: "organizer-1",
  role: "ORGANIZER",
  sessionId: "session-organizer-1"
};

const adminContext = {
  userId: "admin-1",
  role: "ADMIN",
  sessionId: "session-admin-1"
};

const participantContext = {
  userId: "participant-1",
  role: "PARTICIPANT",
  sessionId: "session-participant-1"
};

const organizerToken = signAccessToken(organizerContext);
const adminToken = signAccessToken(adminContext);
const participantToken = signAccessToken(participantContext);

let eventId = "";
let gatewayProcess;
let eventServiceProcess;

test("boot services for S1-T06", async () => {
  await startPostgresContainer();
  await waitForPostgresReady();

  eventServiceProcess = startService(eventServiceCwd, {
    PORT: String(eventServicePort),
    DATABASE_URL: `postgres://${postgresUser}:${postgresPassword}@127.0.0.1:${postgresPort}/${postgresDb}`
  });

  gatewayProcess = startService(gatewayCwd, {
    PORT: String(gatewayPort),
    JWT_ACCESS_SECRET: jwtAccessSecret,
    EVENT_MANAGEMENT_SERVICE_URL: `http://127.0.0.1:${eventServicePort}`
  });

  await waitForReady(`http://127.0.0.1:${eventServicePort}/ready`);
  await waitForReady(`http://127.0.0.1:${gatewayPort}/ready`);
  assert.ok(true);
});

test("gateway proxies organizer event draft create/list routes", async () => {
  const createResponse = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/events/drafts`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${organizerToken}`,
        "x-correlation-id": "s1-t06-corr-create"
      },
      body: JSON.stringify({
        title: "Gateway Event",
        description: "Created through gateway",
        theme: "Tech",
        venueName: "Casablanca Marina",
        city: "Casablanca",
        startAt: "2026-05-10T10:00:00Z",
        timezone: "Africa/Casablanca",
        capacity: 80,
        visibility: "PUBLIC",
        pricingType: "FREE"
      })
    }
  );

  assert.equal(createResponse.response.status, 201);
  assert.equal(createResponse.body.data.organizerId, organizerContext.userId);
  assert.ok(createResponse.body.data.eventId);
  eventId = createResponse.body.data.eventId;

  const listResponse = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/events/drafts?page=1&pageSize=20`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${organizerToken}`
      }
    }
  );
  assert.equal(listResponse.response.status, 200);
  assert.equal(listResponse.body.data.total, 1);
});

test("gateway enforces organizer/admin ACL on event routes", async () => {
  const participantForbidden = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/events/drafts`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${participantToken}`
      }
    }
  );
  assert.equal(participantForbidden.response.status, 403);
  assert.equal(participantForbidden.body.code, "FORBIDDEN");

  const adminAllowed = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/events/drafts/${eventId}`,
    {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: "Gateway Event Updated By Admin"
      })
    }
  );
  assert.equal(adminAllowed.response.status, 200);
  assert.equal(adminAllowed.body.data.title, "Gateway Event Updated By Admin");
});

test("gateway enforces participant-only ACL on registration/profile routes", async () => {
  const organizerForbidden = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/registrations`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        eventId
      })
    }
  );
  assert.equal(organizerForbidden.response.status, 403);
  assert.equal(organizerForbidden.body.code, "FORBIDDEN");

  const adminForbidden = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/profile/participations`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    }
  );
  assert.equal(adminForbidden.response.status, 403);
  assert.equal(adminForbidden.body.code, "FORBIDDEN");

  const participantRouted = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/registrations`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${participantToken}`
      },
      body: JSON.stringify({
        eventId
      })
    }
  );
  assert.equal(participantRouted.response.status, 502);
  assert.equal(participantRouted.body.code, "UPSTREAM_UNREACHABLE");
});

test("shutdown services", async () => {
  if (gatewayProcess && !gatewayProcess.killed) {
    gatewayProcess.kill("SIGTERM");
  }
  if (eventServiceProcess && !eventServiceProcess.killed) {
    eventServiceProcess.kill("SIGTERM");
  }
  await runDocker(["rm", "-f", postgresContainerName]).catch(() => {});
  await delay(100);
  assert.ok(true);
});
