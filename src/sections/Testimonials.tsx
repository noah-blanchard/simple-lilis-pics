"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { ReviewCard } from "@/components/ReviewCard";
import { SectionHeader } from "@/components/SectionHeader";
import { reviews } from "@/data/reviews";
import type { Review } from "@/types";

export const Testimonials = () => {
  const t = useTranslations("testimonials");
  const trackRef = useRef<HTMLDivElement>(null);

  const items: Review[] = reviews.map((r) => ({
    ...r,
    name: t(`reviews.${r.id}.name`),
    role: t(`reviews.${r.id}.role`),
    quote: t(`reviews.${r.id}.quote`),
  }));

  const scrollBy = (amount: number) =>
    trackRef.current?.scrollBy({ left: amount, behavior: "smooth" });

  return (
    <section className="overflow-hidden py-24 md:py-32">
      <SectionHeader
        tag={t("tag")}
        lines={[t("titleLine1"), t("titleLine2")]}
      />
      <Reveal delay={0.1}>
        <div
          ref={trackRef}
          className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:px-12"
        >
          {items.map((review) => (
            <div key={review.id} className="snap-start">
              <ReviewCard review={review} />
            </div>
          ))}
          <div className="w-6 shrink-0" />
        </div>
      </Reveal>
      <div className="mt-8 flex items-center gap-3 px-6 md:px-12">
        <button
          type="button"
          onClick={() => scrollBy(-400)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors hover:bg-white hover:text-ink"
          aria-label={t("previous")}
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(400)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors hover:bg-white hover:text-ink"
          aria-label={t("next")}
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};
