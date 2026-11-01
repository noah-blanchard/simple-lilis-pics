import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { adminFontVariables } from "@/lib/fonts";
import "../globals.css";

// Admin area is private — keep it out of search engines.
export const metadata: Metadata = {
  title: "Admin — Lilis Pics",
  robots: { index: false, follow: false },
};

// `viewportFit: "cover"` is what makes env(safe-area-inset-*) resolve to real
// values on notched iPhones — the mobile tab bar pads itself with it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Root layout for the non-localized admin area (/login, /admin). Provides its
 *  own <html>/<body> since the marketing layout lives under [locale]. */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={adminFontVariables}>
      <body className="bg-ink font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
