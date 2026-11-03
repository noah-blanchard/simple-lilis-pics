import { getWeddingStories } from "@lili/core/data/weddings";
import type { Locale } from "@lili/core/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageTop } from "@/components/PageTop";
import { pageAlternates } from "@/lib/seo";
import { About } from "@/sections/About";
import { Collections } from "@/sections/Collections";
import { HomeStories } from "@/sections/HomeStories";
import { HourByHour } from "@/sections/HourByHour";
import { Invitation } from "@/sections/Invitation";
import { OrderOfService } from "@/sections/OrderOfService";
import { Promises } from "@/sections/Promises";
import { Questions } from "@/sections/Questions";
import { ReplySection } from "@/sections/ReplySection";
import { Words } from "@/sections/Words";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    description: t("description"),
    alternates: pageAlternates("/", locale),
  };
}

export default async function WeddingHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const hasStories = (await getWeddingStories(locale)).length > 0;

  return (
    <>
      <PageTop />
      <main id="main">
        <Invitation locale={locale} hasStories={hasStories} />
        <Promises locale={locale} />
        <HomeStories locale={locale} />
        <HourByHour locale={locale} />
        <About locale={locale} />
        <Words locale={locale} />
        <OrderOfService locale={locale} />
        <Collections locale={locale} />
        <Questions locale={locale} />
        <ReplySection locale={locale} />
      </main>
    </>
  );
}
