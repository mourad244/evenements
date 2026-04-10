const organizerOrAdmin = ["ORGANIZER", "ADMIN"];
const participantOnly = ["PARTICIPANT"];
const authenticatedRoles = ["PARTICIPANT", "ORGANIZER", "ADMIN"];

export function buildRouteTable(config) {
  return [
    {
      method: "POST",
      path: "/api/auth/register",
      public: true,
      targetBaseUrl: config.identityServiceUrl,
      targetPath: "/auth/register"
    },
    {
      method: "POST",
      path: "/api/auth/login",
      public: true,
      targetBaseUrl: config.identityServiceUrl,
      targetPath: "/auth/login"
    },
    {
      method: "POST",
      path: "/api/auth/refresh",
      public: true,
      targetBaseUrl: config.identityServiceUrl,
      targetPath: "/auth/refresh"
    },
    {
      method: "POST",
      path: "/api/auth/forgot-password",
      public: true,
      targetBaseUrl: config.identityServiceUrl,
      targetPath: "/auth/forgot-password"
    },
    {
      method: "POST",
      path: "/api/auth/reset-password",
      public: true,
      targetBaseUrl: config.identityServiceUrl,
      targetPath: "/auth/reset-password"
    },
    {
      method: "GET",
      path: "/api/auth/me",
      public: false,
      allowedRoles: authenticatedRoles,
      targetBaseUrl: config.identityServiceUrl,
      targetPath: "/auth/me"
    },
    {
      method: "GET",
      path: "/api/admin/users",
      public: false,
      allowedRoles: ["ADMIN"],
      targetBaseUrl: config.identityServiceUrl,
      targetPath: "/admin/users"
    },
    {
      method: "GET",
      path: "/api/admin/events",
      public: false,
      allowedRoles: ["ADMIN"],
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/admin/events"
    },
    {
      method: "GET",
      path: "/api/catalog/events",
      public: true,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/catalog/events"
    },
    {
      method: "GET",
      path: "/api/catalog/events/:eventId",
      public: true,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/catalog/events/:eventId"
    },
    {
      method: "POST",
      path: "/api/events/drafts",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/events/drafts"
    },
    {
      method: "GET",
      path: "/api/events/drafts",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/events/drafts"
    },
    {
      method: "GET",
      path: "/api/events/drafts/:eventId",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/events/drafts/:eventId"
    },
    {
      method: "PATCH",
      path: "/api/events/drafts/:eventId",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/events/drafts/:eventId"
    },
    {
      method: "DELETE",
      path: "/api/events/drafts/:eventId",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/events/drafts/:eventId"
    },
    {
      method: "POST",
      path: "/api/events/drafts/:eventId/publish",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/events/drafts/:eventId/publish"
    },
    {
      method: "POST",
      path: "/api/events/:eventId/cancel",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/events/:eventId/cancel"
    },
    {
      method: "GET",
      path: "/api/events/me",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.eventManagementServiceUrl,
      targetPath: "/events/me"
    },
    {
      method: "GET",
      path: "/api/organizer/events/:eventId/registrations",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/organizer/events/:eventId/registrations"
    },
    {
      method: "GET",
      path: "/api/organizer/events/:eventId/registrations/export",
      public: false,
      allowedRoles: organizerOrAdmin,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/organizer/events/:eventId/registrations/export"
    },
    {
      method: "POST",
      path: "/api/registrations",
      public: false,
      allowedRoles: participantOnly,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/registrations"
    },
    {
      method: "POST",
      path: "/api/registrations/:registrationId/cancel",
      public: false,
      allowedRoles: participantOnly,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/registrations/:registrationId/cancel"
    },
    {
      method: "GET",
      path: "/api/tickets/:ticketId",
      public: false,
      allowedRoles: participantOnly,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/tickets/:ticketId"
    },
    {
      method: "GET",
      path: "/api/tickets/:ticketId/download",
      public: false,
      allowedRoles: participantOnly,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/tickets/:ticketId/download"
    },
    {
      method: "GET",
      path: "/api/notifications",
      public: false,
      allowedRoles: authenticatedRoles,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/notifications"
    },
    {
      method: "PATCH",
      path: "/api/notifications/:notificationId/read",
      public: false,
      allowedRoles: authenticatedRoles,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/notifications/:notificationId/read"
    },
    {
      method: "POST",
      path: "/api/payments/session",
      public: false,
      allowedRoles: participantOnly,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/payments/session"
    },
    {
      method: "POST",
      path: "/api/payments/webhook",
      public: true,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/payments/webhook"
    },
    {
      method: "GET",
      path: "/api/profile/participations",
      public: false,
      allowedRoles: participantOnly,
      targetBaseUrl: config.registrationServiceUrl,
      targetPath: "/profile/participations"
    }
  ];
}

export function compileRoutes(routeTable) {
  return routeTable.map((route) => {
    const { regex, paramNames } = compilePathPattern(route.path);
    return {
      ...route,
      normalizedMethod: route.method.toUpperCase(),
      regex,
      paramNames
    };
  });
}

export function matchRoute(compiledRoutes, method, path) {
  const normalizedMethod = method.toUpperCase();
  const requestPath = normalizePath(path);
  for (const route of compiledRoutes) {
    if (route.normalizedMethod !== normalizedMethod) continue;
    const match = route.regex.exec(requestPath);
    if (!match) continue;

    const params = {};
    for (let i = 0; i < route.paramNames.length; i += 1) {
      params[route.paramNames[i]] = decodeURIComponent(match[i + 1]);
    }
    return { route, params };
  }
  return null;
}

export function interpolatePath(pathTemplate, params) {
  let resolvedPath = pathTemplate;
  for (const [key, value] of Object.entries(params || {})) {
    resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(value));
  }
  return resolvedPath;
}

function normalizePath(path) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compilePathPattern(pathPattern) {
  const normalized = normalizePath(pathPattern);
  if (normalized === "/") {
    return { regex: /^\/$/, paramNames: [] };
  }

  const paramNames = [];
  const regexParts = normalized
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1));
        return "([^/]+)";
      }
      return escapeRegex(segment);
    });

  return {
    regex: new RegExp(`^/${regexParts.join("/")}$`),
    paramNames
  };
}
