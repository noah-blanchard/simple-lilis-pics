import { getTranslations } from "next-intl/server";
import { InfiniteRow } from "@/components/InfiniteRow";
import { Reveal } from "@/components/Reveal";
import { ReviewCard } from "@/components/ReviewCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getApprovedRatings } from "@/lib/data/ratings";
import { MIN_PUBLIC_TESTIMONIALS } from "@/lib/rating";

/** Real words from people Lili photographed, collected through the hidden
 *  /rate link and published one by one from /admin/ratings.
 *
 *  A marquee with one or two cards reads as broken, so the whole section stays
 *  out of the page until there are enough — the home page simply doesn't have
 *  a testimonials block yet, rather than having an empty one. */
export const Testimonials = async () => {
  const t = await getTranslations("testimonials");
  const reviews = await getApprovedRatings();

  if (reviews.length < MIN_PUBLIC_TESTIMONIALS) return null;

  const anonymousLabel = t("anonymous");

  return (
    <section className="section-y overflow-hidden">
      <div className="container-site">
        <SectionHeader
          titleBase={t("titleBase")}
          titleAccent={t("titleAccent")}
        />

        {/* Mobile: manual swipe carousel (layout unchanged). */}
        <Reveal delay={0.1} className="md:hidden">
          <div className="no-scrollbar -mx-6 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4">
            {reviews.map((review) => (
              <div key={review.id} className="snap-start">
                <ReviewCard review={review} anonymousLabel={anonymousLabel} />
              </div>
            ))}
            <div className="w-6 shrink-0" />
          </div>
        </Reveal>
      </div>

      {/* Desktop: auto infinite marquee, pauses on hover. Full-bleed (no
          container cap) so it scrolls edge-to-edge regardless of page width. */}
      <Reveal delay={0.1} className="mt-14 hidden md:block 2xl:mt-20">
        <InfiniteRow
          items={reviews}
          direction="left"
          renderItem={(review) => (
            <ReviewCard review={review} anonymousLabel={anonymousLabel} />
          )}
        />
      </Reveal>
    </section>
  );
};
