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
const eventCwd = path.join(repoRoot, "services/event-management-service");
const registrationCwd = path.join(repoRoot, "services/registration-service");
const gatewayCwd = path.join(repoRoot, "services/api-gateway");

const identityPort = Number(process.env.MVP_IDENTITY_PORT || 4201);
const eventPort = Number(process.env.MVP_EVENT_PORT || 4202);
const registrationPort = Number(process.env.MVP_REGISTRATION_PORT || 4203);
const gatewayPort = Number(process.env.MVP_GATEWAY_PORT || 4200);
const postgresPort = Number(process.env.MVP_POSTGRES_PORT || 55433);
const postgresContainerName = `evenements_mvp_pg_${Date.now()}`;
const postgresDb = "evenements_s1_m01";
const postgresUser = "postgres";
const postgresPassword = "postgres";
const postgresImage = "postgres:18";
const useExternalPostgres = process.env.MVP_USE_EXTERNAL_POSTGRES === "true";
const databaseUrl =
  process.env.MVP_DATABASE_URL ||
  `postgres://${postgresUser}:${postgresPassword}@127.0.0.1:${postgresPort}/${postgresDb}`;

const sharedEnv = {
  JWT_ACCESS_SECRET: "mvp-access-secret-6a9f2d7cf6f748c9b8b5a5c1f0c2b7b1",
  JWT_REFRESH_SECRET: "mvp-refresh-secret-9a3f7c2d5b4f48f2b2f99b1d5c8e4a6c"
};

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

async function waitForReady(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // ignored on purpose while booting
    }
    await delay(200);
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

function assertAlias(obj, key, aliasKey) {
  assert.equal(obj[key], obj[aliasKey]);
}

let identityProcess;
let eventProcess;
let registrationProcess;
let gatewayProcess;

let organizerAccessToken = "";
let organizerSessionId = "";
let organizerUserId = "";
let participantAccessToken = "";
let otherParticipantAccessToken = "";
let otherOrganizerAccessToken = "";
let eventId = "";
let registrationId = "";
let ticketId = "";

const uniqueSuffix = Date.now();
const organizerEmail = `organizer-${uniqueSuffix}@example.com`;
const organizerPassword = "InitialPwd#1";
const participantEmail = `participant-${uniqueSuffix}@example.com`;
const participantPassword = "ParticipantPwd#1";
const otherParticipantEmail = `participant-alt-${uniqueSuffix}@example.com`;
const otherParticipantPassword = "ParticipantPwd#1";
const otherOrganizerEmail = `organizer-alt-${uniqueSuffix}@example.com`;
const otherOrganizerPassword = "AltOrganizerPwd#1";

const gatewayBase = `http://127.0.0.1:${gatewayPort}`;

test("boot MVP backend services", async () => {
  if (!useExternalPostgres) {
    await startPostgresContainer();
    await waitForPostgresReady();
  }

  identityProcess = startService(identityCwd, {
    ...sharedEnv,
    PORT: String(identityPort),
    DATABASE_URL: databaseUrl,
    DEBUG_EXPOSE_RESET_TOKEN: "true"
  });

  eventProcess = startService(eventCwd, {
    PORT: String(eventPort),
    DATABASE_URL: databaseUrl
  });

  registrationProcess = startService(registrationCwd, {
    PORT: String(registrationPort),
    DATABASE_URL: databaseUrl,
    EVENT_MANAGEMENT_SERVICE_URL: `http://127.0.0.1:${eventPort}`
  });

  gatewayProcess = startService(gatewayCwd, {
    ...sharedEnv,
    PORT: String(gatewayPort),
    IDENTITY_SERVICE_URL: `http://127.0.0.1:${identityPort}`,
    EVENT_MANAGEMENT_SERVICE_URL: `http://127.0.0.1:${eventPort}`,
    REGISTRATION_SERVICE_URL: `http://127.0.0.1:${registrationPort}`
  });

  await waitForReady(`http://127.0.0.1:${identityPort}/ready`);
  await waitForReady(`http://127.0.0.1:${eventPort}/ready`);
  await waitForReady(`http://127.0.0.1:${registrationPort}/ready`);
  await waitForReady(`${gatewayBase}/ready`);

  assert.ok(true);
});

test("auth register/login/me returns normalized user aliases", async () => {
  const register = await jsonFetch(`${gatewayBase}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email: organizerEmail,
      password: organizerPassword,
      displayName: "Organizer User",
      role: "ORGANIZER"
    })
  });
  assert.equal(register.res.status, 201);
  organizerUserId = register.body.data.userId;

  const login = await jsonFetch(`${gatewayBase}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email: organizerEmail,
      password: organizerPassword
    })
  });
  assert.equal(login.res.status, 200);
  organizerAccessToken = login.body.data.accessToken;
  organizerSessionId = login.body.data.sessionId;

  const registerOtherOrganizer = await jsonFetch(`${gatewayBase}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email: otherOrganizerEmail,
      password: otherOrganizerPassword,
      displayName: "Alt Organizer",
      role: "ORGANIZER"
    })
  });
  assert.equal(registerOtherOrganizer.res.status, 201);

  const loginOtherOrganizer = await jsonFetch(`${gatewayBase}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email: otherOrganizerEmail,
      password: otherOrganizerPassword
    })
  });
  assert.equal(loginOtherOrganizer.res.status, 200);
  otherOrganizerAccessToken = loginOtherOrganizer.body.data.accessToken;

  const me = await jsonFetch(`${gatewayBase}/api/auth/me`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(me.res.status, 200);
  const user = me.body.data.user;
  assertAlias(user, "id", "userId");
  assert.equal(user.userId, organizerUserId);
  assert.ok(user.fullName);
  assert.ok(user.displayName);
  assert.ok(user.name);
  assert.equal(me.body.data.context.sessionId, organizerSessionId);
});

test("profile read/update returns consistent user profile data", async () => {
  const profile = await jsonFetch(`${gatewayBase}/api/profile`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(profile.res.status, 200);
  assert.equal(profile.body.data.userId, organizerUserId);
  assert.ok(profile.body.data.fullName);
  assert.ok(profile.body.data.displayName);
  assert.equal(profile.body.data.email, organizerEmail);

  const update = await jsonFetch(`${gatewayBase}/api/profile`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    },
    body: JSON.stringify({
      fullName: "Organizer Prime",
      displayName: "Organizer Prime",
      phone: "+212600000000",
      city: "Casablanca",
      bio: "Organizer profile updated."
    })
  });
  assert.equal(update.res.status, 200);
  assert.equal(update.body.data.fullName, "Organizer Prime");
  assert.equal(update.body.data.displayName, "Organizer Prime");
  assert.equal(update.body.data.phone, "+212600000000");
  assert.equal(update.body.data.city, "Casablanca");
  assert.equal(update.body.data.bio, "Organizer profile updated.");
  assert.equal(update.body.data.email, organizerEmail);
  assert.equal(update.body.data.role, "ORGANIZER");

  const profileAgain = await jsonFetch(`${gatewayBase}/api/profile`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(profileAgain.res.status, 200);
  assert.equal(profileAgain.body.data.fullName, "Organizer Prime");
  assert.equal(profileAgain.body.data.displayName, "Organizer Prime");
  assert.equal(profileAgain.body.data.phone, "+212600000000");
  assert.equal(profileAgain.body.data.city, "Casablanca");
  assert.equal(profileAgain.body.data.bio, "Organizer profile updated.");
});

test("event draft creation, publish, and normalized event aliases", async () => {
  const draft = await jsonFetch(`${gatewayBase}/api/events/drafts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    },
    body: JSON.stringify({
      title: "MVP Launch Mixer",
      description: "A focused MVP launch evening.",
      theme: "Product",
      venueName: "Atelier Noire",
      city: "Casablanca",
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 90000000).toISOString(),
      timezone: "UTC",
      capacity: 120,
      visibility: "PUBLIC",
      pricingType: "FREE"
    })
  });
  assert.equal(draft.res.status, 201);
  const draftEvent = draft.body.data;
  eventId = draftEvent.eventId;
  assertAlias(draftEvent, "id", "eventId");
  assertAlias(draftEvent, "eventDate", "startAt");
  assertAlias(draftEvent, "eventStartAt", "startAt");
  assert.ok(draftEvent.venue);
  assert.ok(draftEvent.venueName);

  const drafts = await jsonFetch(`${gatewayBase}/api/events/drafts`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(drafts.res.status, 200);
  assert.ok(Array.isArray(drafts.body.data.items));

  const draftDetails = await jsonFetch(`${gatewayBase}/api/events/drafts/${eventId}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(draftDetails.res.status, 200);
  assertAlias(draftDetails.body.data, "id", "eventId");

  const publish = await jsonFetch(`${gatewayBase}/api/events/drafts/${eventId}/publish`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(publish.res.status, 200);
  assert.equal(publish.body.data.status, "PUBLISHED");

  const organizerEvents = await jsonFetch(`${gatewayBase}/api/events/me`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(organizerEvents.res.status, 200);
  assert.ok(Array.isArray(organizerEvents.body.data.items));
});

test("catalog list + detail return normalized event aliases", async () => {
  const catalog = await jsonFetch(`${gatewayBase}/api/catalog/events`, {
    method: "GET"
  });
  assert.equal(catalog.res.status, 200);
  const catalogItem = catalog.body.data.items.find((item) => item.eventId === eventId);
  assert.ok(catalogItem);
  assertAlias(catalogItem, "id", "eventId");
  assertAlias(catalogItem, "eventDate", "startAt");
  assertAlias(catalogItem, "eventStartAt", "startAt");

  const details = await jsonFetch(`${gatewayBase}/api/catalog/events/${eventId}`, {
    method: "GET"
  });
  assert.equal(details.res.status, 200);
  assertAlias(details.body.data, "id", "eventId");
});

test("registration create/cancel and normalized participation/organizer shapes", async () => {
  const registerParticipant = await jsonFetch(`${gatewayBase}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email: participantEmail,
      password: participantPassword,
      displayName: "Participant User",
      role: "PARTICIPANT"
    })
  });
  assert.equal(registerParticipant.res.status, 201);

  const loginParticipant = await jsonFetch(`${gatewayBase}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email: participantEmail,
      password: participantPassword
    })
  });
  assert.equal(loginParticipant.res.status, 200);
  participantAccessToken = loginParticipant.body.data.accessToken;

  const registerOtherParticipant = await jsonFetch(`${gatewayBase}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email: otherParticipantEmail,
      password: otherParticipantPassword,
      displayName: "Alt Participant",
      role: "PARTICIPANT"
    })
  });
  assert.equal(registerOtherParticipant.res.status, 201);

  const loginOtherParticipant = await jsonFetch(`${gatewayBase}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email: otherParticipantEmail,
      password: otherParticipantPassword
    })
  });
  assert.equal(loginOtherParticipant.res.status, 200);
  otherParticipantAccessToken = loginOtherParticipant.body.data.accessToken;

  const registration = await jsonFetch(`${gatewayBase}/api/registrations`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    },
    body: JSON.stringify({
      eventId
    })
  });
  assert.equal(registration.res.status, 201);
  registrationId = registration.body.data.registrationId;
  assert.ok(registrationId);

  const participations = await jsonFetch(`${gatewayBase}/api/profile/participations`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    }
  });
  assert.equal(participations.res.status, 200);
  const participationItem = participations.body.data.items.find(
    (item) => item.registrationId === registrationId
  );
  assert.ok(participationItem);
  assertAlias(participationItem, "id", "registrationId");
  assertAlias(participationItem, "eventDate", "eventStartAt");
  assertAlias(participationItem, "startAt", "eventStartAt");
  assert.ok(participationItem.ticketFormat);
  assert.ok(participationItem.ticketId);
  ticketId = participationItem.ticketId;

  const ticket = await jsonFetch(
    `${gatewayBase}/api/tickets/${participationItem.ticketId}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(ticket.res.status, 200);
  assert.equal(ticket.body.data.ticketId, participationItem.ticketId);
  assert.equal(ticket.body.data.registrationId, registrationId);
  assert.ok(ticket.body.data.payload);

  const notifications = await jsonFetch(`${gatewayBase}/api/notifications`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    }
  });
  assert.equal(notifications.res.status, 200);
  assert.ok(Array.isArray(notifications.body.data.items));
  const notificationItem = notifications.body.data.items[0];
  assert.ok(notificationItem);
  assert.equal(notificationItem.isRead, false);

  const markRead = await jsonFetch(
    `${gatewayBase}/api/notifications/${notificationItem.notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(markRead.res.status, 200);
  assert.equal(markRead.body.data.isRead, true);

  const otherParticipantNotifications = await jsonFetch(
    `${gatewayBase}/api/notifications`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${otherParticipantAccessToken}`
      }
    }
  );
  assert.equal(otherParticipantNotifications.res.status, 200);
  const crossReadAttempt = await jsonFetch(
    `${gatewayBase}/api/notifications/${notificationItem.notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${otherParticipantAccessToken}`
      }
    }
  );
  assert.equal(crossReadAttempt.res.status, 404);

  const organizerRegs = await jsonFetch(
    `${gatewayBase}/api/organizer/events/${eventId}/registrations`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${organizerAccessToken}`
      }
    }
  );
  assert.equal(organizerRegs.res.status, 200);
  const organizerItem = organizerRegs.body.data.items.find(
    (item) => item.registrationId === registrationId
  );
  assert.ok(organizerItem);
  assertAlias(organizerItem, "registrationStatus", "status");

  const paymentSession = await jsonFetch(`${gatewayBase}/api/payments/session`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    },
    body: JSON.stringify({
      amount: 200,
      currency: "MAD",
      registrationId,
      eventId,
      metadata: {
        source: "mvp-smoke"
      }
    })
  });
  assert.equal(paymentSession.res.status, 201);
  assert.equal(paymentSession.body.data.status, "PENDING");
  assert.ok(paymentSession.body.data.providerSessionId);

  const otherParticipantPaymentSession = await jsonFetch(
    `${gatewayBase}/api/payments/session`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${otherParticipantAccessToken}`
      },
      body: JSON.stringify({
        amount: 200,
        currency: "MAD",
        registrationId,
        eventId
      })
    }
  );
  assert.equal(otherParticipantPaymentSession.res.status, 403);

  const ticketPending = await jsonFetch(
    `${gatewayBase}/api/tickets/${participationItem.ticketId}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(ticketPending.res.status, 410);

  const webhookUpdate = await jsonFetch(`${gatewayBase}/api/payments/webhook`, {
    method: "POST",
    body: JSON.stringify({
      paymentId: paymentSession.body.data.paymentId,
      webhookId: "whk-test-1",
      status: "SUCCEEDED",
      providerPaymentId: "test-payment-id"
    })
  });
  assert.equal(webhookUpdate.res.status, 200);
  assert.equal(webhookUpdate.body.data.status, "SUCCEEDED");

  const webhookRepeat = await jsonFetch(`${gatewayBase}/api/payments/webhook`, {
    method: "POST",
    body: JSON.stringify({
      paymentId: paymentSession.body.data.paymentId,
      webhookId: "whk-test-1",
      status: "SUCCEEDED",
      providerPaymentId: "test-payment-id"
    })
  });
  assert.equal(webhookRepeat.res.status, 200);
  assert.equal(webhookRepeat.body.data.status, "SUCCEEDED");
  assert.equal(webhookRepeat.body.data.idempotent, true);

  const ticketIssued = await jsonFetch(
    `${gatewayBase}/api/tickets/${participationItem.ticketId}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(ticketIssued.res.status, 200);

  const cancel = await jsonFetch(
    `${gatewayBase}/api/registrations/${registrationId}/cancel`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(cancel.res.status, 200);
  assert.equal(cancel.body.data.status, "CANCELLED");

  const cancelledTicket = await jsonFetch(
    `${gatewayBase}/api/tickets/${participationItem.ticketId}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(cancelledTicket.res.status, 410);
});

test("authorization negative paths are enforced", async () => {
  const participantAdminEvents = await jsonFetch(`${gatewayBase}/api/admin/events`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    }
  });
  assert.equal(participantAdminEvents.res.status, 403);

  const participantAdminUsers = await jsonFetch(`${gatewayBase}/api/admin/users`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    }
  });
  assert.equal(participantAdminUsers.res.status, 403);

  const organizerAdminUsers = await jsonFetch(`${gatewayBase}/api/admin/users`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(organizerAdminUsers.res.status, 403);

  const organizerAdminEvents = await jsonFetch(`${gatewayBase}/api/admin/events`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${organizerAccessToken}`
    }
  });
  assert.equal(organizerAdminEvents.res.status, 403);

  const participantOrganizerList = await jsonFetch(`${gatewayBase}/api/events/me`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    }
  });
  assert.equal(participantOrganizerList.res.status, 403);

  const participantDrafts = await jsonFetch(`${gatewayBase}/api/events/drafts`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${participantAccessToken}`
    }
  });
  assert.equal(participantDrafts.res.status, 403);

  const participantDraftDetails = await jsonFetch(
    `${gatewayBase}/api/events/drafts/${eventId}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(participantDraftDetails.res.status, 403);

  const otherOrganizerDraft = await jsonFetch(
    `${gatewayBase}/api/events/drafts/${eventId}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${otherOrganizerAccessToken}`
      }
    }
  );
  assert.equal(otherOrganizerDraft.res.status, 403);

  const otherOrganizerRegistrations = await jsonFetch(
    `${gatewayBase}/api/organizer/events/${eventId}/registrations`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${otherOrganizerAccessToken}`
      }
    }
  );
  assert.equal(otherOrganizerRegistrations.res.status, 404);

  const participantOrganizerRegistrations = await jsonFetch(
    `${gatewayBase}/api/organizer/events/${eventId}/registrations`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(participantOrganizerRegistrations.res.status, 403);

  const otherOrganizerExport = await jsonFetch(
    `${gatewayBase}/api/organizer/events/${eventId}/registrations/export`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${otherOrganizerAccessToken}`
      }
    }
  );
  assert.equal(otherOrganizerExport.res.status, 404);

  const participantOrganizerExport = await jsonFetch(
    `${gatewayBase}/api/organizer/events/${eventId}/registrations/export`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${participantAccessToken}`
      }
    }
  );
  assert.equal(participantOrganizerExport.res.status, 403);

  const otherParticipantTicket = await jsonFetch(
    `${gatewayBase}/api/tickets/${ticketId}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${otherOrganizerAccessToken}`
      }
    }
  );
  assert.equal(otherParticipantTicket.res.status, 403);

  const crossParticipantTicket = await jsonFetch(
    `${gatewayBase}/api/tickets/${ticketId}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${otherParticipantAccessToken}`
      }
    }
  );
  assert.equal(crossParticipantTicket.res.status, 403);
});

test("shutdown MVP backend services", async () => {
  if (gatewayProcess && !gatewayProcess.killed) {
    gatewayProcess.kill("SIGTERM");
  }
  if (registrationProcess && !registrationProcess.killed) {
    registrationProcess.kill("SIGTERM");
  }
  if (eventProcess && !eventProcess.killed) {
    eventProcess.kill("SIGTERM");
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
