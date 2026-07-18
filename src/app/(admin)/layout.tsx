import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  JetBrains_Mono,
  Lexend_Deca,
} from "next/font/google";
import type { ReactNode } from "react";
import { InlineScript } from "@/components/theme/InlineScript";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { themeInitScript } from "@/components/theme/theme-script";
import "../globals.css";

const playfairDisplay = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Lexend_Deca({
  variable: "--font-sans-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Admin area is private — keep it out of search engines.
export const metadata: Metadata = {
  title: "Admin — Lilis Pics",
  robots: { index: false, follow: false },
};

/** Root layout for the non-localized admin area (/login, /admin). Provides its
 *  own <html>/<body> since the marketing layout lives under [locale]. */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink font-sans text-fg antialiased">
        <InlineScript html={themeInitScript()} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
