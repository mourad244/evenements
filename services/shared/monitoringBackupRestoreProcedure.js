const BACKUP_TYPE = "BACKUP";
const RESTORE_TYPE = "RESTORE";

const ALLOWED_ENVIRONMENTS = new Set([
  "dev",
  "integration",
  "staging",
  "production"
]);

const BACKUP_SCOPE_COMPONENTS = {
  full: [
    "identity-db",
    "event-management-db",
    "registration-db",
    "payment-db",
    "media-object-storage",
    "ticket-object-storage",
    "config-manifests"
  ],
  critical_only: ["identity-db", "registration-db", "payment-db"]
};

export function normalizeProcedureEnvironment(environment) {
  const normalized = String(environment || "").trim().toLowerCase();
  return ALLOWED_ENVIRONMENTS.has(normalized) ? normalized : "staging";
}

export function normalizeProcedureScope(scope) {
  const normalized = String(scope || "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(BACKUP_SCOPE_COMPONENTS, normalized)
    ? normalized
    : "full";
}

export function buildBackupProcedurePlan({
  environment = "staging",
  scope = "full",
  requestedBy = null,
  now = new Date().toISOString()
} = {}) {
  const normalizedEnvironment = normalizeProcedureEnvironment(environment);
  const normalizedScope = normalizeProcedureScope(scope);
  const components = BACKUP_SCOPE_COMPONENTS[normalizedScope];
  const procedureId = buildProcedureId("bkp", normalizedEnvironment, now);

  return {
    procedureId,
    type: BACKUP_TYPE,
    environment: normalizedEnvironment,
    scope: normalizedScope,
    components,
    requestedBy: normalizeOptionalString(requestedBy),
    createdAt: now,
    steps: [
      {
        id: "BK-01",
        title: "Precheck health and dependencies",
        required: true,
        commandHint: "verify /health and /ready for critical services",
        expectedResult: "All critical services reachable and healthy"
      },
      {
        id: "BK-02",
        title: "Freeze critical write paths",
        required: true,
        commandHint:
          "enable maintenance write guard for registration/payment paths",
        expectedResult: "No new critical writes during snapshot window"
      },
      {
        id: "BK-03",
        title: "Create point-in-time database backups",
        required: true,
        commandHint: "dump/snapshot identity, registration, payment, event DBs",
        expectedResult: "Consistent PIT backup artifacts generated"
      },
      {
        id: "BK-04",
        title: "Backup object storage artifacts",
        required: true,
        commandHint: "sync media and ticket buckets with versioning",
        expectedResult: "Object storage snapshot replicated to backup target"
      },
      {
        id: "BK-05",
        title: "Export configuration manifests",
        required: true,
        commandHint: "export service config and secret references",
        expectedResult: "Encrypted config manifest archived"
      },
      {
        id: "BK-06",
        title: "Validate backup integrity",
        required: true,
        commandHint: "checksum + artifact inventory verification",
        expectedResult: "Integrity checks pass for all required artifacts"
      },
      {
        id: "BK-07",
        title: "Release write guard and publish backup report",
        required: true,
        commandHint: "disable maintenance guard and publish report",
        expectedResult: "Normal write flow resumed and report emitted"
      }
    ],
    successCriteria: [
      "All required artifacts generated",
      "Integrity checks successful",
      "RPO target respected for selected scope",
      "Audit events emitted (BACKUP_JOB_STARTED/BACKUP_JOB_COMPLETED)"
    ]
  };
}

export function buildRestoreProcedurePlan({
  environment = "staging",
  scope = "full",
  requestedBy = null,
  now = new Date().toISOString()
} = {}) {
  const normalizedEnvironment = normalizeProcedureEnvironment(environment);
  const normalizedScope = normalizeProcedureScope(scope);
  const components = BACKUP_SCOPE_COMPONENTS[normalizedScope];
  const procedureId = buildProcedureId("rst", normalizedEnvironment, now);

  return {
    procedureId,
    type: RESTORE_TYPE,
    environment: normalizedEnvironment,
    scope: normalizedScope,
    components,
    requestedBy: normalizeOptionalString(requestedBy),
    createdAt: now,
    steps: [
      {
        id: "RS-01",
        title: "Confirm incident scope and target restore point",
        required: true,
        commandHint: "select restore timestamp and impacted domains",
        expectedResult: "Approved restore point and scope documented"
      },
      {
        id: "RS-02",
        title: "Prepare isolated restore workspace",
        required: true,
        commandHint: "provision isolated environment and block external writes",
        expectedResult: "Safe workspace ready for restore"
      },
      {
        id: "RS-03",
        title: "Restore identity, registration and payment databases",
        required: true,
        commandHint: "restore T0 DBs from PIT backups",
        expectedResult: "Critical transactional data restored"
      },
      {
        id: "RS-04",
        title: "Restore event and ticketing assets",
        required: true,
        commandHint: "restore event-management DB and object artifacts",
        expectedResult: "Event/ticket artifacts consistent with DB state"
      },
      {
        id: "RS-05",
        title: "Restore configs and redeploy services",
        required: true,
        commandHint: "apply backed-up config manifests and roll services",
        expectedResult: "Services running with restored configuration"
      },
      {
        id: "RS-06",
        title: "Run post-restore integrity checks",
        required: true,
        commandHint:
          "verify schema, counts and cross-domain invariants payment<->registration<->ticket",
        expectedResult: "No blocking integrity mismatch remains"
      },
      {
        id: "RS-07",
        title: "Progressive traffic re-enable",
        required: true,
        commandHint: "open traffic gradually and monitor error budget",
        expectedResult: "Traffic restored with stable error and latency"
      }
    ],
    successCriteria: [
      "Critical services restored in defined order",
      "Data integrity checks successful",
      "RTO target respected for selected scope",
      "Audit events emitted (RESTORE_TEST_EXECUTED/RESTORE_PROCEDURE_COMPLETED)"
    ]
  };
}

export function validateProcedureExecution({
  plan,
  executedSteps = []
} = {}) {
  const normalizedPlan = normalizePlan(plan);
  const executedIds = Array.isArray(executedSteps)
    ? executedSteps.map((step) => String(step || "").trim()).filter(Boolean)
    : [];
  const requiredStepIds = normalizedPlan.steps
    .filter((step) => step.required !== false)
    .map((step) => step.id);

  const missingRequiredSteps = requiredStepIds.filter(
    (stepId) => !executedIds.includes(stepId)
  );
  const unexpectedSteps = executedIds.filter(
    (stepId) => !normalizedPlan.steps.some((step) => step.id === stepId)
  );
  const outOfOrderSteps = detectOutOfOrder(requiredStepIds, executedIds);

  const status =
    missingRequiredSteps.length === 0 &&
    outOfOrderSteps.length === 0 &&
    unexpectedSteps.length === 0
      ? "COMPLETED"
      : "PARTIAL";

  return {
    status,
    missingRequiredSteps,
    outOfOrderSteps,
    unexpectedSteps,
    completionRate: Number(
      (
        ((requiredStepIds.length - missingRequiredSteps.length) /
          Math.max(requiredStepIds.length, 1)) *
        100
      ).toFixed(2)
    )
  };
}

export function buildProcedureExecutionReport({
  plan,
  executedSteps = [],
  actorId = null,
  correlationId = null,
  now = new Date().toISOString()
} = {}) {
  const normalizedPlan = normalizePlan(plan);
  const validation = validateProcedureExecution({
    plan: normalizedPlan,
    executedSteps
  });

  const isBackup = normalizedPlan.type === BACKUP_TYPE;
  const action =
    validation.status === "COMPLETED"
      ? isBackup
        ? "BACKUP_JOB_COMPLETED"
        : "RESTORE_PROCEDURE_COMPLETED"
      : isBackup
        ? "BACKUP_JOB_FAILED"
        : "RESTORE_PROCEDURE_FAILED";

  return {
    procedureId: normalizedPlan.procedureId,
    procedureType: normalizedPlan.type,
    status: validation.status,
    validation,
    audit: {
      action,
      procedureId: normalizedPlan.procedureId,
      actorId: normalizeOptionalString(actorId),
      correlationId: normalizeOptionalString(correlationId),
      environment: normalizedPlan.environment,
      scope: normalizedPlan.scope,
      at: now
    }
  };
}

function normalizePlan(plan = {}) {
  const type = String(plan.type || "").trim().toUpperCase();
  return {
    procedureId: normalizeOptionalString(plan.procedureId) || "unknown-procedure",
    type: type === BACKUP_TYPE || type === RESTORE_TYPE ? type : BACKUP_TYPE,
    environment: normalizeProcedureEnvironment(plan.environment),
    scope: normalizeProcedureScope(plan.scope),
    steps: Array.isArray(plan.steps) ? plan.steps : []
  };
}

function detectOutOfOrder(requiredStepIds, executedIds) {
  if (requiredStepIds.length === 0 || executedIds.length === 0) {
    return [];
  }
  const executedPositions = requiredStepIds
    .map((stepId) => ({
      stepId,
      position: executedIds.indexOf(stepId)
    }))
    .filter((entry) => entry.position >= 0);

  const outOfOrder = [];
  let maxPositionSeen = -1;
  for (const entry of executedPositions) {
    if (entry.position < maxPositionSeen) {
      outOfOrder.push(entry.stepId);
    }
    maxPositionSeen = Math.max(maxPositionSeen, entry.position);
  }
  return outOfOrder;
}

function buildProcedureId(prefix, environment, nowIso) {
  const safePrefix = String(prefix || "proc").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeEnv = String(environment || "env").replace(/[^a-zA-Z0-9_-]/g, "");
  const stamp = String(nowIso || "")
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  return `${safePrefix}_${safeEnv}_${stamp || "0"}`;
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
