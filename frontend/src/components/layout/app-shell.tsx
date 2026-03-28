import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-app text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(255,122,58,0.16),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(17,24,39,0.1),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/60" />
      <Navbar />
      <main className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
