import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBackupProcedurePlan,
  buildProcedureExecutionReport,
  buildRestoreProcedurePlan,
  normalizeProcedureEnvironment,
  normalizeProcedureScope,
  validateProcedureExecution
} from "../services/shared/monitoringBackupRestoreProcedure.js";

test("normalizeProcedureEnvironment and normalizeProcedureScope use safe defaults", () => {
  assert.equal(normalizeProcedureEnvironment("production"), "production");
  assert.equal(normalizeProcedureEnvironment("unknown"), "staging");
  assert.equal(normalizeProcedureScope("full"), "full");
  assert.equal(normalizeProcedureScope("bad"), "full");
});

test("buildBackupProcedurePlan returns ordered required steps and metadata", () => {
  const plan = buildBackupProcedurePlan({
    environment: "production",
    scope: "critical_only",
    requestedBy: "ops-user",
    now: "2026-03-11T14:00:00.000Z"
  });

  assert.equal(plan.type, "BACKUP");
  assert.equal(plan.environment, "production");
  assert.equal(plan.scope, "critical_only");
  assert.match(plan.procedureId, /^bkp_production_/);
  assert.equal(plan.steps[0].id, "BK-01");
  assert.equal(plan.steps[plan.steps.length - 1].id, "BK-07");
  assert.ok(plan.steps.every((step) => step.required === true));
  assert.deepEqual(plan.components, ["identity-db", "registration-db", "payment-db"]);
});

test("buildRestoreProcedurePlan enforces critical restore order", () => {
  const plan = buildRestoreProcedurePlan({
    environment: "integration",
    scope: "full",
    now: "2026-03-11T14:01:00.000Z"
  });

  const stepIds = plan.steps.map((step) => step.id);
  assert.equal(plan.type, "RESTORE");
  assert.equal(stepIds[0], "RS-01");
  assert.equal(stepIds[2], "RS-03");
  assert.equal(stepIds[stepIds.length - 1], "RS-07");
});

test("validateProcedureExecution returns COMPLETED when all required steps executed in order", () => {
  const plan = buildBackupProcedurePlan();
  const executed = plan.steps.map((step) => step.id);

  const validation = validateProcedureExecution({
    plan,
    executedSteps: executed
  });

  assert.equal(validation.status, "COMPLETED");
  assert.equal(validation.missingRequiredSteps.length, 0);
  assert.equal(validation.outOfOrderSteps.length, 0);
  assert.equal(validation.unexpectedSteps.length, 0);
  assert.equal(validation.completionRate, 100);
});

test("validateProcedureExecution detects missing, out-of-order and unexpected steps", () => {
  const plan = buildRestoreProcedurePlan();
  const executed = ["RS-01", "RS-03", "RS-02", "RS-04", "RS-99"];

  const validation = validateProcedureExecution({
    plan,
    executedSteps: executed
  });

  assert.equal(validation.status, "PARTIAL");
  assert.ok(validation.missingRequiredSteps.includes("RS-05"));
  assert.ok(validation.outOfOrderSteps.includes("RS-03"));
  assert.deepEqual(validation.unexpectedSteps, ["RS-99"]);
});

test("buildProcedureExecutionReport emits completion audit for backup success", () => {
  const plan = buildBackupProcedurePlan({
    now: "2026-03-11T14:02:00.000Z"
  });
  const executed = plan.steps.map((step) => step.id);

  const report = buildProcedureExecutionReport({
    plan,
    executedSteps: executed,
    actorId: "ops-1",
    correlationId: "corr-backup-1",
    now: "2026-03-11T14:10:00.000Z"
  });

  assert.equal(report.status, "COMPLETED");
  assert.equal(report.audit.action, "BACKUP_JOB_COMPLETED");
  assert.equal(report.audit.actorId, "ops-1");
  assert.equal(report.audit.correlationId, "corr-backup-1");
});

test("buildProcedureExecutionReport emits failure audit for restore partial run", () => {
  const plan = buildRestoreProcedurePlan({
    now: "2026-03-11T14:03:00.000Z"
  });

  const report = buildProcedureExecutionReport({
    plan,
    executedSteps: ["RS-01", "RS-03"],
    actorId: "ops-2",
    correlationId: "corr-restore-1",
    now: "2026-03-11T14:15:00.000Z"
  });

  assert.equal(report.status, "PARTIAL");
  assert.equal(report.audit.action, "RESTORE_PROCEDURE_FAILED");
  assert.ok(report.validation.missingRequiredSteps.length > 0);
});
