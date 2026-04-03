import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EventOS — Discover & Manage Events",
    template: "%s · EventOS"
  },
  description:
    "Discover events, register as a participant, or manage your own as an organizer. EventOS brings public event discovery, registrations, ticketing, and back-office tools into one platform.",
  keywords: ["events", "event management", "registrations", "tickets", "organizer"],
  openGraph: {
    title: "EventOS — Discover & Manage Events",
    description:
      "Discover events, register as a participant, or manage your own as an organizer.",
    type: "website",
    locale: "en_US",
    siteName: "EventOS"
  }
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
