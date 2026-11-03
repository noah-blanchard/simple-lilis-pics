import type { Locale } from "@lili/core/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageTop } from "@/components/PageTop";
import { Tone } from "@/components/Tone";
import { PRIVACY_UPDATED } from "@/data/legal";
import { formatLongDate } from "@/lib/format";
import { rawItems } from "@/lib/messages";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

interface Section {
  heading: string;
  body: string[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: pageAlternates("/privacy", locale),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });
  const sections = rawItems<Section>(t, "sections");

  return (
    <>
      <PageTop />
      <main id="main">
        <Tone tone="day" className="section-y pt-12 md:pt-16">
          <div className="container-site">
            <article className="mx-auto max-w-[44em]">
              <h1 className="display-xl text-[clamp(40px,5vw,72px)]">
                {t("title")}
              </h1>
              <p className="mt-4 text-muted italic">
                {t("updated", {
                  date: formatLongDate(PRIVACY_UPDATED, locale),
                })}
              </p>
              <p className="mt-10 text-body-fluid text-fg/80">{t("intro")}</p>
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="display mt-14 text-[clamp(26px,2.4vw,34px)]">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-fg/80">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </Tone>
      </main>
    </>
  );
}
