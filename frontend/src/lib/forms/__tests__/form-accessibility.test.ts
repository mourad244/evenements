import { focusFirstErrorField, getFieldErrorMessages } from "../form-accessibility";

describe("form accessibility helpers", () => {
  it("returns trimmed error messages in order", () => {
    const messages = getFieldErrorMessages({
      email: { message: "  Enter a valid email address.  " },
      password: { message: "Password is required." },
      role: undefined
    });

    expect(messages).toEqual([
      "Enter a valid email address.",
      "Password is required."
    ]);
  });

  it("focuses the first error field in the provided order", () => {
    const setFocus = vi.fn();

    focusFirstErrorField(
      ["email", "password", "confirmPassword"],
      {
        password: { message: "Password is required." },
        confirmPassword: { message: "Passwords do not match." }
      },
      setFocus
    );

    expect(setFocus).toHaveBeenCalledWith("password", { shouldSelect: true });
  });
});
