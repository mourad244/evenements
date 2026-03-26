import { randomUUID } from "node:crypto";

const allowedActorRoles = new Set(["PARTICIPANT", "ORGANIZER", "ADMIN", "SYSTEM"]);
const allowedResults = new Set(["SUCCESS", "FAILURE", "DENIED"]);

function normalizeOptionalText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function normalizeRequiredText(value, fallback) {
  return normalizeOptionalText(value) || fallback;
}

function normalizeActorRole(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (allowedActorRoles.has(normalized)) {
    return normalized;
  }
  return "SYSTEM";
}

function normalizeResult(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (allowedResults.has(normalized)) {
    return normalized;
  }
  return "FAILURE";
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  const normalized = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || typeof value === "function") {
      continue;
    }
    normalized[key] = value;
  }
  return normalized;
}

export function buildAuthSecurityAuditRecord({
  auditId,
  occurredAt,
  sourceService,
  actorId,
  actorRole,
  action,
  targetType,
  targetId,
  result,
  correlationId,
  reasonCode,
  reasonNote,
  metadata,
  ipAddress,
  userAgent
} = {}) {
  return {
    auditId: normalizeRequiredText(auditId, randomUUID()),
    occurredAt: normalizeRequiredText(occurredAt, new Date().toISOString()),
    sourceService: normalizeRequiredText(sourceService, "identity-access-service"),
    actorId: normalizeRequiredText(actorId, "anonymous"),
    actorRole: normalizeActorRole(actorRole),
    action: normalizeRequiredText(action, "AUTH_EVENT"),
    targetType: normalizeRequiredText(targetType, "AUTH"),
    targetId: normalizeRequiredText(targetId, "unknown"),
    result: normalizeResult(result),
    correlationId: normalizeRequiredText(correlationId, "uncorrelated"),
    reasonCode: normalizeOptionalText(reasonCode),
    reasonNote: normalizeOptionalText(reasonNote),
    metadata: normalizeMetadata(metadata),
    ipAddress: normalizeOptionalText(ipAddress),
    userAgent: normalizeOptionalText(userAgent)
  };
}
