import type { Metadata } from "next";
import { JetBrains_Mono, Outfit, PT_Serif_Caption } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { InlineScript } from "@/components/theme/InlineScript";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { themeInitScript } from "@/components/theme/theme-script";
import { routing } from "@/i18n/routing";
import "../globals.css";

const ptSerifCaption = PT_Serif_Caption({
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", fr: "/fr" },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: "Lilis Pics",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${ptSerifCaption.variable} ${outfit.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink font-sans text-fg antialiased">
        <InlineScript html={themeInitScript()} />
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
