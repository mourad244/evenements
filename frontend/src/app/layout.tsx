import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Platform",
  description: "Frontend starter for a microservices-based event management platform."
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
