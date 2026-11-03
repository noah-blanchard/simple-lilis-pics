import type { Locale } from "@lili/core/i18n/routing";
import { PillButton } from "@lili/ui/components/PillButton";
import { Reveal } from "@lili/ui/components/Reveal";
import { getTranslations } from "next-intl/server";
import { Photo } from "@/components/Photo";
import { Rule } from "@/components/Rule";
import { Sheet } from "@/components/Sheet";
import { TextLink } from "@/components/TextLink";
import { Tone } from "@/components/Tone";
import { HERO_PHOTO, PLACEHOLDERS } from "@/data/placeholder-photos";
import { renderAccentLine } from "@/lib/accent";

interface InvitationProps {
  locale: Locale;
  hasStories: boolean;
}

const LEAD = "font-display text-[20px] text-muted italic md:text-[22px]";

// The hero: a printed invitation card, then one wide photograph. The host line
// is this section's only capitals (D9).
export const Invitation = async ({ locale, hasStories }: InvitationProps) => {
  const t = await getTranslations({ locale, namespace: "hero" });
  const photo = PLACEHOLDERS[HERO_PHOTO];

  return (
    <Tone tone="day" id="invitation" className="pt-10 pb-24 md:pt-14 md:pb-32">
      <div className="container-site">
        <Reveal>
          <Sheet
            keyline
            className="mx-auto flex max-w-[720px] flex-col items-center gap-5 px-8 py-14 text-center sm:px-14 md:py-20"
          >
            <p className="font-display text-[15px] uppercase tracking-[0.08em] md:text-[17px]">
              {t("host")}
            </p>
            <p className={LEAD}>{t("lead")}</p>
            <h1 className="display-xl text-[clamp(44px,7vw,104px)] leading-[1.02]">
              {renderAccentLine(t("title"))}
            </h1>
            <p className={LEAD}>{t("lead2")}</p>
            <p className="max-w-[26em] text-body-fluid text-fg/75">
              {t("place")} {t("reassurance")}
            </p>
            <Rule />
            <p className="text-[16px] text-muted italic">{t("availability")}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
              <PillButton variant="light" href="#reply">
                {t("cta")}
              </PillButton>
              {hasStories ? (
                <TextLink href="/stories">{t("storiesLink")}</TextLink>
              ) : null}
            </div>
          </Sheet>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <Photo
            src={photo.src}
            alt={photo.alt[locale]}
            ratio="4/5"
            className="md:aspect-[16/9]"
            sizes="(min-width: 1440px) 90vw, 100vw"
            priority
          />
        </Reveal>
      </div>
    </Tone>
  );
};
