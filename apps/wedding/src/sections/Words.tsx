import type { Locale } from "@lili/core/i18n/routing";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { getTranslations } from "next-intl/server";
import { FlashPhoto } from "@/components/FlashPhoto";
import { Tone } from "@/components/Tone";
import { WordsCarousel } from "@/components/WordsCarousel";
import { PLACEHOLDERS, WORDS_PHOTOS } from "@/data/placeholder-photos";
import { DEV_WORDS, type Word } from "@/data/words.dev";
import { rawItems } from "@/lib/messages";

// Testimonials ship empty (D14): the section does not exist until real words do.
export const Words = async ({ locale }: { locale: Locale }) => {
  const t = await getTranslations({ locale, namespace: "words" });
  const items = rawItems<Word>(t, "items");
  const words =
    items.length > 0
      ? items
      : process.env.NODE_ENV === "development"
        ? DEV_WORDS
        : [];
  if (words.length === 0) return null;

  const [first, second] = WORDS_PHOTOS.map((k) => PLACEHOLDERS[k]);

  return (
    <Tone
      tone="night"
      as="section"
      id="words"
      aria-labelledby="words-title"
      className="section-y"
    >
      <div className="container-site">
        <SectionHeader
          id="words-title"
          titleBase={t("titleBase")}
          titleAccent={t("titleAccent")}
        />
        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <WordsCarousel
              words={words}
              previous={t("previous")}
              next={t("next")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            <FlashPhoto
              src={first.src}
              alt={first.alt[locale]}
              ratio="4/5"
              sizes="(min-width: 1024px) 20vw, 45vw"
            />
            <FlashPhoto
              src={second.src}
              alt={second.alt[locale]}
              ratio="4/5"
              sizes="(min-width: 1024px) 20vw, 45vw"
              delay={0.2}
              className="mt-12"
            />
          </div>
        </div>
      </div>
    </Tone>
  );
};
