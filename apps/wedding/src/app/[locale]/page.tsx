import type { Locale } from "@lili/core/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { PageTop } from "@/components/PageTop";
import { HourByHour } from "@/sections/HourByHour";
import { Invitation } from "@/sections/Invitation";
import { Promises } from "@/sections/Promises";

export default async function WeddingHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageTop />
      <main id="main">
        <Invitation locale={locale} hasStories={false} />
        <Promises locale={locale} />
        {/* Phase 10: <HomeStories /> */}
        <HourByHour locale={locale} />
        {/* Phase 08: night sections */}
      </main>
    </>
  );
}
