"use client";

import { useTranslations } from "next-intl";
import { InfiniteRow } from "@/components/InfiniteRow";
import { SectionHeader } from "@/components/SectionHeader";
import { SpecialtyCard } from "@/components/SpecialtyCard";
import { specialties } from "@/data/specialties";
import type { Specialty as SpecialtyType } from "@/types";

export const Specialty = () => {
  const t = useTranslations("specialty");

  const items: SpecialtyType[] = specialties.map((s) => ({
    ...s,
    title: t(`items.${s.id}.title`),
    desc: t(`items.${s.id}.desc`),
  }));

  return (
    <section className="section-y">
      <div className="container-site">
        <SectionHeader
          titleBase={t("titleBase")}
          titleAccent={t("titleAccent")}
        />

        {/* Mobile: static 2-col grid (layout unchanged). */}
        <div className="mt-16 grid grid-cols-2 gap-5 md:hidden">
          {items.map((item) => (
            <SpecialtyCard key={item.id} specialty={item} />
          ))}
        </div>
      </div>

      {/* Desktop: two infinite carousel rows, scrolling in opposite directions.
          Left full-bleed (no container cap) so the marquee scrolls edge-to-edge. */}
      <div className="mt-16 hidden flex-col gap-5 md:flex">
        <InfiniteRow
          items={items.slice(0, 4)}
          direction="left"
          repeat={4}
          renderItem={(item) => (
            <div className="w-[220px] md:w-[260px] lg:w-[300px] xl:w-[340px] 2xl:w-[380px]">
              <SpecialtyCard specialty={item} tilt />
            </div>
          )}
        />
        <InfiniteRow
          items={items.slice(4)}
          direction="right"
          repeat={4}
          renderItem={(item) => (
            <div className="w-[220px] md:w-[260px] lg:w-[300px] xl:w-[340px] 2xl:w-[380px]">
              <SpecialtyCard specialty={item} tilt />
            </div>
          )}
        />
      </div>
    </section>
  );
};
