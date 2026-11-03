import type { ResolvedWeddingStory } from "@lili/core/data/weddings";
import type { Locale } from "@lili/core/i18n/routing";
import { getTranslations } from "next-intl/server";
import { seasonOf } from "@/lib/format";

/** The back of a photograph: the couple, then where, when and how many. */
export const StoryCaption = async ({
  story,
  locale,
}: {
  story: ResolvedWeddingStory;
  locale: Locale;
}) => {
  const t = await getTranslations({ locale, namespace: "stories" });
  const bits: string[] = [];
  if (story.venue) bits.push(story.venue);
  if (story.date) {
    bits.push(
      t("seasonYear", {
        season: t(`seasons.${seasonOf(story.date)}`),
        year: story.date.slice(0, 4),
      }),
    );
  }
  bits.push(t("photographs", { count: story.photos.length }));

  return (
    <div className="mt-4">
      <p className="display text-[24px] italic leading-tight">{story.couple}</p>
      <p className="mt-1 text-[15px] text-muted">{bits.join(", ")}</p>
    </div>
  );
};
