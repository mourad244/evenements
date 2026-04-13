type ErrorLike = {
  message?: string;
};

export function getFieldErrorMessages(errors: Record<string, ErrorLike | undefined>) {
  return Object.values(errors)
    .map((error) => error?.message?.trim())
    .filter((message): message is string => Boolean(message));
}

export function focusFirstErrorField<TField extends string>(
  fieldOrder: readonly TField[],
  errors: Record<string, unknown>,
  setFocus: (field: TField, options?: { shouldSelect?: boolean }) => void
) {
  const firstField = fieldOrder.find((field) => Boolean(errors[field]));
  if (firstField) {
    setFocus(firstField, { shouldSelect: true });
  }
}
