import { getWeddingStory } from "@lili/core/data/weddings";
import type { Locale } from "@lili/core/i18n/routing";
import { Reveal } from "@lili/ui/components/Reveal";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageTop } from "@/components/PageTop";
import { Photo } from "@/components/Photo";
import { StoryGallery } from "@/components/StoryGallery";
import { StoryPrint } from "@/components/StoryPrint";
import { TextLink } from "@/components/TextLink";
import { Tone } from "@/components/Tone";
import { seasonOf } from "@/lib/format";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const found = await getWeddingStory(slug, locale);
  if (!found) return {};
  const t = await getTranslations({ locale, namespace: "stories" });
  const { story } = found;
  const season = story.date
    ? t("seasonYear", {
        season: t(`seasons.${seasonOf(story.date)}`),
        year: story.date.slice(0, 4),
      })
    : "";
  return {
    title: story.couple,
    description: [story.venue, season].filter(Boolean).join(", "),
    openGraph: story.cover ? { images: [story.cover.img] } : undefined,
  };
}

export default async function StoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const found = await getWeddingStory(slug, locale);
  if (!found) notFound();
  const { story, next } = found;
  const t = await getTranslations({ locale, namespace: "stories" });

  const meta = [
    story.venue,
    story.date
      ? t("seasonYear", {
          season: t(`seasons.${seasonOf(story.date)}`),
          year: story.date.slice(0, 4),
        })
      : "",
    t(`types.${story.type}`),
  ]
    .filter(Boolean)
    .join(", ");

  // The cover is shown large above; keep it out of the rows when it leads them.
  const photos =
    story.cover && story.photos[0]?.id === story.cover.id
      ? story.photos.slice(1)
      : story.photos;
  const quote = story.quote
    ? locale === "fr"
      ? `\u00ab\u202f${story.quote}\u202f\u00bb`
      : `\u201c${story.quote}\u201d`
    : "";

  return (
    <>
      <PageTop />
      <main id="main">
        <Tone tone="day" className="pt-10 md:pt-14">
          <div className="container-site">
            <TextLink href="/stories">{t("back")}</TextLink>
            <h1 className="display-xl mt-8 text-[clamp(44px,6.5vw,96px)] leading-[1.02]">
              {story.couple}
            </h1>
            <p className="mt-4 text-body-fluid text-muted">{meta}</p>
            {story.cover ? (
              <Reveal className="mt-12">
                <Photo
                  src={story.cover.img}
                  alt={
                    story.venue
                      ? `${story.couple}, ${story.venue}`
                      : story.couple
                  }
                  ratio="3/2"
                  className="md:aspect-[16/9]"
                  sizes="(min-width: 1440px) 90vw, 100vw"
                  priority
                />
              </Reveal>
            ) : null}
            {quote ? (
              <figure className="mx-auto my-24 max-w-3xl text-center">
                <blockquote className="display text-[clamp(28px,3vw,44px)] italic leading-[1.15]">
                  {quote}
                </blockquote>
                <figcaption className="mt-5 text-muted">
                  {story.couple}
                </figcaption>
              </figure>
            ) : (
              <div className="h-16" />
            )}
          </div>
        </Tone>
        <StoryGallery
          photos={photos}
          label={story.couple}
          alt={story.venue ? `${story.couple}, ${story.venue}` : story.couple}
          nightFooter={
            next ? (
              <div className="container-site mt-24 grid gap-10 md:grid-cols-12 md:items-center">
                <div className="md:col-span-4">
                  <StoryPrint story={next} locale={locale} />
                </div>
                <div className="md:col-span-6 md:col-start-6">
                  <TextLink
                    href={`/stories/${next.slug}`}
                    className="display text-[clamp(28px,3vw,44px)]"
                  >
                    {t("next")}
                  </TextLink>
                </div>
              </div>
            ) : null
          }
        />
      </main>
    </>
  );
}
