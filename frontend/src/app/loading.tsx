export default function GlobalLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--ink)] border-t-transparent" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">Loading content...</p>
      </div>
    </div>
  );
}
