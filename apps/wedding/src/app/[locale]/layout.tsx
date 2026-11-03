import { routing } from "@lili/core/i18n/routing";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { FloatingMenuButton } from "@/components/FloatingMenuButton";
import { MenuProvider } from "@/components/MenuProvider";
import { publicFontVariables } from "@/lib/fonts";
import { Footer } from "@/sections/Footer";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3052";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    // Scaffold: not indexed until the wedding site launches.
    robots: { index: false, follow: false },
  };
}

export default async function LocaleLayout({
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
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale} className={publicFontVariables}>
      <body className="bg-ink font-sans text-fg antialiased">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-menu)] focus:bg-sheet focus:px-4 focus:py-2"
          >
            {t("skip")}
          </a>
          <MenuProvider>
            {children}
            <FloatingMenuButton />
            <Footer />
          </MenuProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
