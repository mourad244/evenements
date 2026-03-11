import assert from "node:assert/strict";
import test from "node:test";

import {
  buildA11yFieldProps,
  buildA11yMessageIds,
  normalizeFieldId
} from "../services/shared/a11yFieldHelper.js";

test("normalizeFieldId trims and falls back when empty", () => {
  assert.equal(normalizeFieldId("  email "), "email");
  assert.equal(normalizeFieldId(""), "field");
});

test("buildA11yMessageIds builds hint and error ids", () => {
  const ids = buildA11yMessageIds("email");
  assert.equal(ids.hintId, "email-hint");
  assert.equal(ids.errorId, "email-error");
});

test("buildA11yFieldProps returns describedby in correct order", () => {
  const props = buildA11yFieldProps({
    fieldId: "email",
    hasError: true,
    hintId: "email-hint",
    errorId: "email-error"
  });
  assert.equal(props.id, "email");
  assert.equal(props["aria-invalid"], "true");
  assert.equal(props["aria-describedby"], "email-hint email-error");
  assert.equal(props["aria-errormessage"], "email-error");
});

test("buildA11yFieldProps deduplicates describedBy entries", () => {
  const props = buildA11yFieldProps({
    fieldId: "email",
    hasError: false,
    hintId: "email-hint",
    describedBy: ["email-hint", "extra-info", "extra-info"]
  });
  assert.equal(props["aria-describedby"], "email-hint extra-info");
});
