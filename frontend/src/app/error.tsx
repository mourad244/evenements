"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if present
    console.error("Global Error Boundary caught an error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="grid max-w-md gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Something went wrong!</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          We encountered an unexpected error while trying to load this page. 
          Please try again.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
