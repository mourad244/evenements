export function normalizeFieldId(fieldId, fallback = "field") {
  const normalized = String(fieldId || "").trim();
  return normalized || fallback;
}

export function buildA11yMessageIds(fieldId) {
  const baseId = normalizeFieldId(fieldId);
  return {
    hintId: `${baseId}-hint`,
    errorId: `${baseId}-error`
  };
}

export function buildA11yFieldProps({
  fieldId,
  hasError = false,
  hintId,
  errorId,
  describedBy = []
} = {}) {
  const normalizedFieldId = normalizeFieldId(fieldId);
  const ids = [];

  if (hintId) ids.push(String(hintId));
  if (hasError && errorId) ids.push(String(errorId));

  for (const extra of describedBy) {
    const value = String(extra || "").trim();
    if (!value) continue;
    if (!ids.includes(value)) ids.push(value);
  }

  const describedByValue = ids.length > 0 ? ids.join(" ") : undefined;
  const errorMessageValue = hasError && errorId ? String(errorId) : undefined;

  return {
    id: normalizedFieldId,
    "aria-invalid": hasError ? "true" : "false",
    "aria-describedby": describedByValue,
    "aria-errormessage": errorMessageValue
  };
}
