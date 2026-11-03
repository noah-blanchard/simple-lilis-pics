import type { Locale } from "@lili/core/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { PageTop } from "@/components/PageTop";
import { About } from "@/sections/About";
import { Collections } from "@/sections/Collections";
import { HourByHour } from "@/sections/HourByHour";
import { Invitation } from "@/sections/Invitation";
import { OrderOfService } from "@/sections/OrderOfService";
import { Promises } from "@/sections/Promises";
import { Questions } from "@/sections/Questions";
import { Words } from "@/sections/Words";

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
        <About locale={locale} />
        <Words locale={locale} />
        <OrderOfService locale={locale} />
        <Collections locale={locale} />
        <Questions locale={locale} />
        {/* Phase 11: <ReplySection /> */}
      </main>
    </>
  );
}
