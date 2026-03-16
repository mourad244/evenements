export function isGatewayAuthPath(req) {
  return (
    String(req.path || "").startsWith("/api/auth") ||
    String(req.matchedRoute?.path || "").startsWith("/api/auth")
  );
}

export function gatewayAuthLogFields(req) {
  return {
    route: req.matchedRoute?.path || null,
    userId: req.auth?.userId || null,
    role: req.auth?.role || null
  };
}
