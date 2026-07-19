"use client";

import { useTranslations } from "next-intl";
import { InfiniteRow } from "@/components/InfiniteRow";
import { Reveal } from "@/components/Reveal";
import { ReviewCard } from "@/components/ReviewCard";
import { SectionHeader } from "@/components/SectionHeader";
import { reviews } from "@/data/reviews";
import type { Review } from "@/types";

export const Testimonials = () => {
  const t = useTranslations("testimonials");

  const items: Review[] = reviews.map((r) => ({
    ...r,
    name: t(`reviews.${r.id}.name`),
    role: t(`reviews.${r.id}.role`),
    quote: t(`reviews.${r.id}.quote`),
  }));

  return (
    <section className="overflow-hidden py-24 md:py-32">
      <SectionHeader
        tag={t("tag")}
        titleBase={t("titleBase")}
        titleAccent={t("titleAccent")}
      />

      {/* Mobile: manual swipe carousel (layout unchanged). */}
      <Reveal delay={0.1} className="md:hidden">
        <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4">
          {items.map((review) => (
            <div key={review.id} className="snap-start">
              <ReviewCard review={review} />
            </div>
          ))}
          <div className="w-6 shrink-0" />
        </div>
      </Reveal>

      {/* Desktop: auto infinite marquee, pauses on hover. */}
      <Reveal delay={0.1} className="mt-14 hidden md:block">
        <InfiniteRow
          items={items}
          direction="left"
          renderItem={(review) => <ReviewCard review={review} />}
        />
      </Reveal>
    </section>
  );
};
