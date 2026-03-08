import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

const repoRoot = "/home/mourad/git_workspace_work/evenements";
const serviceCwd = `${repoRoot}/services/event-management-service`;

const servicePort = 4202;
const postgresPort = 55433;
const postgresContainerName = `evenements_s1_t05_pg_${Date.now()}`;
const postgresDb = "evenements_s1_t05";
const postgresUser = "postgres";
const postgresPassword = "postgres";

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
      // waiting
    }
    await delay(300);
  }
  throw new Error("Postgres container did not become ready in time");
}

async function waitForReady(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // waiting
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

function authHeaders(userId, role = "ORGANIZER") {
  return {
    "x-user-id": userId,
    "x-user-role": role,
    "x-session-id": `session-${userId}`,
    "x-correlation-id": `corr-${userId}`
  };
}

const organizerA = "organizer-a";
const organizerB = "organizer-b";
let serviceProcess;
let eventId;

test("boot event-management-service", async () => {
  await startPostgresContainer();
  await waitForPostgresReady();

  serviceProcess = spawn("node", ["src/index.js"], {
    cwd: serviceCwd,
    env: {
      ...process.env,
      PORT: String(servicePort),
      DATABASE_URL: `postgres://${postgresUser}:${postgresPassword}@127.0.0.1:${postgresPort}/${postgresDb}`
    },
    stdio: "pipe"
  });

  await waitForReady(`http://127.0.0.1:${servicePort}/ready`);
  assert.ok(true);
});

test("POST /events/drafts creates draft for organizer", async () => {
  const createResponse = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts`,
    {
      method: "POST",
      headers: authHeaders(organizerA, "ORGANIZER"),
      body: JSON.stringify({
        title: "Forum IA 2026",
        description: "Conference IA",
        theme: "Tech",
        venueName: "Anfa Park",
        city: "Casablanca",
        startAt: "2026-04-02T09:00:00Z",
        timezone: "Africa/Casablanca",
        capacity: 120,
        visibility: "PUBLIC",
        pricingType: "FREE"
      })
    }
  );

  assert.equal(createResponse.response.status, 201);
  assert.equal(createResponse.body.success, true);
  assert.equal(createResponse.body.data.status, "DRAFT");
  assert.equal(createResponse.body.data.organizerId, organizerA);
  eventId = createResponse.body.data.eventId;
});

test("GET /events/drafts scopes list by organizer ownership", async () => {
  const ownerList = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts?page=1&pageSize=20`,
    {
      method: "GET",
      headers: authHeaders(organizerA, "ORGANIZER")
    }
  );
  assert.equal(ownerList.response.status, 200);
  assert.equal(ownerList.body.data.total, 1);

  const otherList = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts?page=1&pageSize=20`,
    {
      method: "GET",
      headers: authHeaders(organizerB, "ORGANIZER")
    }
  );
  assert.equal(otherList.response.status, 200);
  assert.equal(otherList.body.data.total, 0);
});

test("GET/PATCH/DELETE enforce ownership rules", async () => {
  const unauthorizedGet = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts/${eventId}`,
    {
      method: "GET",
      headers: authHeaders(organizerB, "ORGANIZER")
    }
  );
  assert.equal(unauthorizedGet.response.status, 403);

  const unauthorizedPatch = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts/${eventId}`,
    {
      method: "PATCH",
      headers: authHeaders(organizerB, "ORGANIZER"),
      body: JSON.stringify({ title: "Hacked title" })
    }
  );
  assert.equal(unauthorizedPatch.response.status, 403);

  const ownerPatch = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts/${eventId}`,
    {
      method: "PATCH",
      headers: authHeaders(organizerA, "ORGANIZER"),
      body: JSON.stringify({ title: "Forum IA 2026 - Updated" })
    }
  );
  assert.equal(ownerPatch.response.status, 200);
  assert.equal(ownerPatch.body.data.title, "Forum IA 2026 - Updated");

  const unauthorizedDelete = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts/${eventId}`,
    {
      method: "DELETE",
      headers: authHeaders(organizerB, "ORGANIZER")
    }
  );
  assert.equal(unauthorizedDelete.response.status, 403);

  const ownerDelete = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts/${eventId}`,
    {
      method: "DELETE",
      headers: authHeaders(organizerA, "ORGANIZER")
    }
  );
  assert.equal(ownerDelete.response.status, 204);

  const notFoundAfterDelete = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts/${eventId}`,
    {
      method: "GET",
      headers: authHeaders(organizerA, "ORGANIZER")
    }
  );
  assert.equal(notFoundAfterDelete.response.status, 404);
});

test("validation and auth errors", async () => {
  const missingAuth = await jsonFetch(`http://127.0.0.1:${servicePort}/events/drafts`, {
    method: "GET"
  });
  assert.equal(missingAuth.response.status, 401);

  const forbiddenRole = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts`,
    {
      method: "GET",
      headers: authHeaders("participant-1", "PARTICIPANT")
    }
  );
  assert.equal(forbiddenRole.response.status, 403);

  const invalidCreate = await jsonFetch(
    `http://127.0.0.1:${servicePort}/events/drafts`,
    {
      method: "POST",
      headers: authHeaders(organizerA, "ORGANIZER"),
      body: JSON.stringify({
        title: "Invalid Event"
      })
    }
  );
  assert.equal(invalidCreate.response.status, 400);
});

test("shutdown", async () => {
  if (serviceProcess && !serviceProcess.killed) {
    serviceProcess.kill("SIGTERM");
  }
  await runDocker(["rm", "-f", postgresContainerName]).catch(() => {});
  await delay(100);
  assert.ok(true);
});

