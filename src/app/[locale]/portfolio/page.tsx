import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { PortfolioBento } from "@/sections/PortfolioBento";

export default function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  // Opt into static rendering for this locale before reading translations.
  setRequestLocale(locale);

  return <PortfolioBento />;
}
