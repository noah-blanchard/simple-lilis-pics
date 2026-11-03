import type { Locale } from "@lili/core/i18n/routing";
import { Reveal } from "@lili/ui/components/Reveal";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { getTranslations } from "next-intl/server";
import { Print } from "@/components/Print";
import { TextLink } from "@/components/TextLink";
import { Tone } from "@/components/Tone";
import { portfolioHref } from "@/data/nav";
import { ABOUT_PORTRAIT, PLACEHOLDERS } from "@/data/placeholder-photos";
import { rawList } from "@/lib/messages";

// A white print lying on the dark table, and Lili's short introduction.
export const About = async ({ locale }: { locale: Locale }) => {
  const t = await getTranslations({ locale, namespace: "about" });
  const photo = PLACEHOLDERS[ABOUT_PORTRAIT];

  return (
    <Tone
      tone="night"
      as="section"
      id="about"
      aria-labelledby="about-title"
      className="section-y"
    >
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-5">
          <Print
            photo={{
              src: photo.src,
              alt: photo.alt[locale],
              ratio: "4/5",
              sizes: "(min-width: 1024px) 40vw, 100vw",
            }}
            rotate={-1.5}
          />
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <SectionHeader
            align="left"
            id="about-title"
            titleBase={t("titleBase")}
            titleAccent={t("titleAccent")}
          />
          <Reveal delay={0.1}>
            <div className="mt-8 max-w-[34em] space-y-5 text-body-fluid text-fg/75">
              {rawList(t, "body").map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2} className="mt-8">
            <TextLink href={portfolioHref(locale)} external>
              {t("link")}
            </TextLink>
          </Reveal>
        </div>
      </div>
    </Tone>
  );
};
