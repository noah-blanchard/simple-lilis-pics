import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import "../../../globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const outfit = Outfit({
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

// A hidden link handed out in person — never index it.
export const metadata: Metadata = {
  title: "Rate the experience — Lilis Pics",
  robots: { index: false, follow: false },
};

// Phone-only surface. Zoom stays enabled: capping it would break the page for
// anyone who needs to magnify.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout for the rating flow. It supplies its own <html>/<body> — like the
 * (admin) group — because the localized marketing layout renders the floating
 * menu button, and a nested layout cannot remove chrome its parent added. This
 * page has to be nothing but the stars.
 *
 * The locale is an explicit path segment rather than a next-intl prefix: a
 * stranger's phone must not pick the language via cookie or Accept-Language,
 * Lili chooses it when she generates the QR. That also means this route sits
 * outside the intl proxy, so messages are passed to the provider explicitly.
 */
export default async function RateLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${playfairDisplay.variable} ${outfit.variable} ${jetBrainsMono.variable}`}
    >
      <body className="bg-ink font-sans text-fg antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
