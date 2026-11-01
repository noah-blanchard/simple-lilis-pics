import { getPublicLinksPage } from "@lili/core/data/links";
import type { Locale } from "@lili/core/i18n/routing";
import { LinksPageContent } from "@lili/ui/components/links/LinksPageContent";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "links" });
  const { settings } = await getPublicLinksPage(locale as Locale);
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
      images: settings.bannerImageUrl ? [settings.bannerImageUrl] : undefined,
    },
    twitter: {
      card: settings.bannerImageUrl ? "summary_large_image" : "summary",
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
  const { links, socials, settings } = await getPublicLinksPage(
    locale as Locale,
  );

  return (
    <LinksPageContent
      links={links}
      socials={socials}
      locale={locale as Locale}
      description={settings.tagline ?? t("description")}
      emptyLabel={t("empty")}
      linksLabel={t("listLabel")}
      socialsLabel={t("socialsLabel")}
      opensNewTabLabel={t("opensNewTab")}
      backHomeLabel={t("backHome")}
      homeHref={getPathname({ href: "/", locale: locale as Locale })}
      bannerImageUrl={settings.bannerImageUrl}
      bannerFocalX={settings.bannerFocalX}
      bannerFocalY={settings.bannerFocalY}
    />
  );
}
