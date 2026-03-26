import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Platform",
  description: "Frontend starter for a microservices-based event management platform."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
