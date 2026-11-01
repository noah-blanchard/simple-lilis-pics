import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getAllProjects } from "@/lib/data/projects";
import { PortfolioBento } from "@/sections/PortfolioBento";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return { title: t("allTitleBase") + t("allTitleAccent") };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Opt into static rendering for this locale before reading translations.
  setRequestLocale(locale);

  const items = await getAllProjects(locale as Locale);

  return <PortfolioBento items={items} />;
}
