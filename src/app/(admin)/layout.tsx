import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "../globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
      className={`${hankenGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <body className="bg-ink font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
