import { getWeddingStories } from "@lili/core/data/weddings";
import type { Locale } from "@lili/core/i18n/routing";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageTop } from "@/components/PageTop";
import { StoriesIndex } from "@/components/StoriesIndex";
import { StoryPrint } from "@/components/StoryPrint";
import { Tone } from "@/components/Tone";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const ROTATIONS = [-1, 0.8, -0.5];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("storiesTitle"),
    description: t("storiesDescription"),
    alternates: pageAlternates("/stories", locale),
  };
}

export default async function StoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "stories" });
  const stories = await getWeddingStories(locale);

  const presentTypes = Array.from(new Set(stories.map((s) => s.type)));
  const filters = presentTypes.map((type) => ({
    key: type,
    label: t(`filters.${type}`),
  }));
  const items = stories.map((story, i) => ({
    slug: story.slug,
    type: story.type,
    node: (
      <StoryPrint
        story={story}
        locale={locale}
        rotate={ROTATIONS[i % ROTATIONS.length]}
      />
    ),
  }));

  return (
    <>
      <PageTop />
      <main id="main">
        <Tone tone="day" className="section-y pt-12 md:pt-16">
          <div className="container-site">
            <SectionHeader
              as="h1"
              titleBase={t("titleBase")}
              titleAccent={t("titleAccent")}
            />
            <p className="mx-auto mt-6 max-w-[34em] text-center text-muted">
              {t("intro")}
            </p>
            {stories.length === 0 ? (
              <p className="mt-16 text-center text-muted italic">
                {t("empty")}
              </p>
            ) : (
              <StoriesIndex
                items={items}
                filters={filters}
                allLabel={t("filters.all")}
              />
            )}
          </div>
        </Tone>
      </main>
    </>
  );
}
