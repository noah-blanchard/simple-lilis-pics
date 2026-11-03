import { getWeddingStories } from "@lili/core/data/weddings";
import type { Locale } from "@lili/core/i18n/routing";
import { Reveal } from "@lili/ui/components/Reveal";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { getTranslations } from "next-intl/server";
import { StoryPrint } from "@/components/StoryPrint";
import { TextLink } from "@/components/TextLink";
import { Tone } from "@/components/Tone";

const ROTATIONS = [-1, 0.8, -0.5];

// The three latest stories. The section does not exist until a story does.
export const HomeStories = async ({ locale }: { locale: Locale }) => {
  const stories = (await getWeddingStories(locale)).slice(0, 3);
  if (stories.length === 0) return null;
  const t = await getTranslations({ locale, namespace: "stories" });

  return (
    <Tone
      tone="day"
      as="section"
      id="stories"
      aria-labelledby="stories-title"
      className="section-y"
    >
      <div className="container-site">
        <SectionHeader
          id="stories-title"
          titleBase={t("titleBase")}
          titleAccent={t("titleAccent")}
        />
        <ul className="mt-14 grid list-none gap-x-8 gap-y-14 md:grid-cols-3">
          {stories.map((story, i) => (
            <li key={story.slug}>
              <Reveal delay={i * 0.08}>
                <StoryPrint
                  story={story}
                  locale={locale}
                  rotate={ROTATIONS[i % ROTATIONS.length]}
                />
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="mt-14 text-center">
          <TextLink href="/stories">{t("all")}</TextLink>
        </div>
      </div>
    </Tone>
  );
};
