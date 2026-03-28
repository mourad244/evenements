import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

const repoRoot = "/home/mourad/git_workspace_work/evenements";
const eventServiceCwd = path.join(repoRoot, "services/event-management-service");
const gatewayCwd = path.join(repoRoot, "services/api-gateway");

const gatewayPort = 4300;
const eventServicePort = 4302;
const missingRegistrationPort = 4303;
const postgresPort = 55434;
const postgresContainerName = `evenements_s1_t02_pg_${Date.now()}`;
const postgresDb = "evenements_s1_t02";
const postgresUser = "postgres";
const postgresPassword = "postgres";
const accessSecret = "s1-t02-access-secret";

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
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
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
      // Waiting for Postgres boot.
    }
    await delay(300);
  }

  throw new Error("Postgres container did not become ready in time");
}

async function waitForReady(url, timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Waiting for service boot.
    }
    await delay(150);
  }

  throw new Error(`Service not ready: ${url}`);
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  return { response, body };
}

function accessToken(userId, role) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url"
  );
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      role,
      sid: `session-${userId}`,
      account_status: "ACTIVE",
      iat: nowSeconds,
      exp: nowSeconds + 900
    })
  ).toString("base64url");
  const signature = createHmac("sha256", accessSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

function authHeaders(userId, role) {
  return {
    authorization: `Bearer ${accessToken(userId, role)}`
  };
}

let gatewayProcess;
let eventServiceProcess;
let createdEventId;

test("boot gateway and event-management-service for S1-T02", async () => {
  await startPostgresContainer();
  await waitForPostgresReady();

  eventServiceProcess = startService(eventServiceCwd, {
    PORT: String(eventServicePort),
    DATABASE_URL: `postgres://${postgresUser}:${postgresPassword}@127.0.0.1:${postgresPort}/${postgresDb}`
  });

  gatewayProcess = startService(gatewayCwd, {
    PORT: String(gatewayPort),
    JWT_ACCESS_SECRET: accessSecret,
    EVENT_MANAGEMENT_SERVICE_URL: `http://127.0.0.1:${eventServicePort}`,
    REGISTRATION_SERVICE_URL: `http://127.0.0.1:${missingRegistrationPort}`
  });

  await waitForReady(`http://127.0.0.1:${eventServicePort}/ready`);
  await waitForReady(`http://127.0.0.1:${gatewayPort}/ready`);
  assert.ok(true);
});

test("gateway proxies event draft CRUD requests for organizers", async () => {
  const correlationId = "s1-t02-event-draft";
  const createResponse = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/events/drafts`, {
    method: "POST",
    headers: {
      ...authHeaders("organizer-a", "ORGANIZER"),
      "x-correlation-id": correlationId
    },
    body: JSON.stringify({
      title: "Gateway Event",
      description: "Created through gateway",
      theme: "Tech",
      venueName: "Anfa Park",
      city: "Casablanca",
      startAt: "2026-04-10T09:00:00Z",
      timezone: "Africa/Casablanca",
      capacity: 50,
      visibility: "PUBLIC",
      pricingType: "FREE"
    })
  });

  assert.equal(createResponse.response.status, 201);
  assert.equal(createResponse.body.success, true);
  assert.equal(createResponse.response.headers.get("x-correlation-id"), correlationId);
  createdEventId = createResponse.body.data.eventId;

  const listResponse = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/events/drafts?page=1&pageSize=20`,
    {
      method: "GET",
      headers: authHeaders("organizer-a", "ORGANIZER")
    }
  );

  assert.equal(listResponse.response.status, 200);
  assert.equal(listResponse.body.success, true);
  assert.equal(listResponse.body.data.total, 1);
  assert.equal(listResponse.body.data.items[0].eventId, createdEventId);
});

test("gateway keeps event ACL and service ownership checks intact", async () => {
  const forbiddenByRole = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/events/drafts?page=1&pageSize=20`,
    {
      method: "GET",
      headers: authHeaders("participant-a", "PARTICIPANT")
    }
  );

  assert.equal(forbiddenByRole.response.status, 403);
  assert.equal(forbiddenByRole.body.code, "FORBIDDEN");

  const forbiddenByOwnership = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/events/drafts/${createdEventId}`,
    {
      method: "GET",
      headers: authHeaders("organizer-b", "ORGANIZER")
    }
  );

  assert.equal(forbiddenByOwnership.response.status, 403);
  assert.equal(forbiddenByOwnership.body.code, "FORBIDDEN");
});

test("gateway applies participant ACL to registration facade routes", async () => {
  const organizerResponse = await jsonFetch(`http://127.0.0.1:${gatewayPort}/api/registrations`, {
    method: "POST",
    headers: authHeaders("organizer-a", "ORGANIZER"),
    body: JSON.stringify({ eventId: createdEventId })
  });

  assert.equal(organizerResponse.response.status, 403);
  assert.equal(organizerResponse.body.code, "FORBIDDEN");

  const participantResponse = await jsonFetch(
    `http://127.0.0.1:${gatewayPort}/api/profile/participations?page=1&pageSize=20`,
    {
      method: "GET",
      headers: authHeaders("participant-a", "PARTICIPANT")
    }
  );

  assert.equal(participantResponse.response.status, 502);
  assert.equal(participantResponse.body.code, "UPSTREAM_UNREACHABLE");
});

test("shutdown", async () => {
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
