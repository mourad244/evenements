type FormErrorSummaryProps = {
  title: string;
  messages: string[];
};

export function FormErrorSummary({ title, messages }: FormErrorSummaryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-[24px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.18)] px-4 py-3 text-sm text-[var(--status-danger)] shadow-[0_16px_34px_rgba(127,29,29,0.14)]"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--status-danger)]">
        {title}
      </h3>
      <ul className="mt-2 grid list-disc gap-1.5 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </section>
  );
}
