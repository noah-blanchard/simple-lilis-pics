import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { LinksPageContent } from "@/components/links/LinksPageContent";
import type { Locale } from "@/i18n/routing";
import { getPublishedLinks } from "@/lib/data/links";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "links" });
  const path = locale === "fr" ? "/fr/links" : "/links";
  return {
    metadataBase: new URL(SITE_URL),
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: path,
      languages: { en: "/links", fr: "/fr/links" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: path,
      siteName: "Lilis Pics",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function LinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "links" });
  const links = await getPublishedLinks(locale as Locale);

  return (
    <LinksPageContent
      links={links}
      locale={locale as Locale}
      description={t("description")}
      emptyLabel={t("empty")}
      linksLabel={t("listLabel")}
      opensNewTabLabel={t("opensNewTab")}
      localeControl={<LocaleSwitcher />}
    />
  );
}
