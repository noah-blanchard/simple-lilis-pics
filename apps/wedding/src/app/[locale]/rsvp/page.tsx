import type { Locale } from "@lili/core/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageTop } from "@/components/PageTop";
import { ReplySection } from "@/sections/ReplySection";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("rsvpTitle"), description: t("rsvpDescription") };
}

export default async function RsvpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageTop />
      <main id="main">
        <ReplySection locale={locale} headingAs="h1" />
      </main>
    </>
  );
}
