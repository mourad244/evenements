import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRouteTable,
  compileRoutes,
  interpolatePath,
  matchRoute
} from "../services/api-gateway/src/routing.js";

const config = {
  identityServiceUrl: "http://identity.local",
  eventManagementServiceUrl: "http://event.local",
  registrationServiceUrl: "http://registration.local"
};

function findRoute(routes, method, path) {
  return routes.find((route) => route.method === method && route.path === path);
}

test("S1-T02 route table exposes required event and registration proxies", () => {
  const routes = buildRouteTable(config);

  const eventRoutes = [
    ["POST", "/api/events/drafts", "/events/drafts"],
    ["GET", "/api/events/drafts", "/events/drafts"],
    ["GET", "/api/events/drafts/:eventId", "/events/drafts/:eventId"],
    ["PATCH", "/api/events/drafts/:eventId", "/events/drafts/:eventId"],
    ["DELETE", "/api/events/drafts/:eventId", "/events/drafts/:eventId"],
    [
      "POST",
      "/api/events/drafts/:eventId/publish",
      "/events/drafts/:eventId/publish"
    ],
    ["POST", "/api/events/:eventId/cancel", "/events/:eventId/cancel"],
    ["GET", "/api/events/me", "/events/me"]
  ];

  for (const [method, path, targetPath] of eventRoutes) {
    const route = findRoute(routes, method, path);
    assert.ok(route, `missing event route ${method} ${path}`);
    assert.equal(route.public, false);
    assert.deepEqual(route.allowedRoles, ["ORGANIZER", "ADMIN"]);
    assert.equal(route.targetBaseUrl, config.eventManagementServiceUrl);
    assert.equal(route.targetPath, targetPath);
  }

  const participantRoutes = [
    ["POST", "/api/registrations", "/registrations"],
    [
      "POST",
      "/api/registrations/:registrationId/cancel",
      "/registrations/:registrationId/cancel"
    ],
    ["GET", "/api/tickets/:ticketId/download", "/tickets/:ticketId/download"],
    ["GET", "/api/profile/participations", "/profile/participations"]
  ];

  for (const [method, path, targetPath] of participantRoutes) {
    const route = findRoute(routes, method, path);
    assert.ok(route, `missing participant route ${method} ${path}`);
    assert.equal(route.public, false);
    assert.deepEqual(route.allowedRoles, ["PARTICIPANT"]);
    assert.equal(route.targetBaseUrl, config.registrationServiceUrl);
    assert.equal(route.targetPath, targetPath);
  }
});

test("route matcher resolves dynamic parameters and ACL map paths", () => {
  const routes = buildRouteTable(config);
  const compiled = compileRoutes(routes);

  const eventMatch = matchRoute(
    compiled,
    "POST",
    "/api/events/drafts/evt-100/publish"
  );
  assert.ok(eventMatch);
  assert.equal(eventMatch.route.path, "/api/events/drafts/:eventId/publish");
  assert.equal(eventMatch.params.eventId, "evt-100");

  const cancelMatch = matchRoute(
    compiled,
    "POST",
    "/api/registrations/reg-55/cancel"
  );
  assert.ok(cancelMatch);
  assert.equal(
    cancelMatch.route.path,
    "/api/registrations/:registrationId/cancel"
  );
  assert.equal(cancelMatch.params.registrationId, "reg-55");

  const profileMatch = matchRoute(
    compiled,
    "GET",
    "/api/profile/participations/"
  );
  assert.ok(profileMatch);
  assert.equal(profileMatch.route.path, "/api/profile/participations");
});

test("interpolatePath encodes route params for upstream path templates", () => {
  const path = interpolatePath("/events/drafts/:eventId", {
    eventId: "event with spaces"
  });
  assert.equal(path, "/events/drafts/event%20with%20spaces");
});
