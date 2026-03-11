export function isIdentityAuthPath(req) {
  return String(req.path || "").startsWith("/auth");
}

export function identityAuthLogFields(req) {
  return {
    callerUserId: readHeader(req, "x-user-id"),
    callerRole: readHeader(req, "x-user-role")
  };
}

function readHeader(req, name) {
  if (typeof req.header === "function") {
    return req.header(name) || null;
  }
  const headers = req.headers || {};
  return headers[name] ?? headers[name.toLowerCase()] ?? null;
}
