"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { SpecialtyCard } from "@/components/SpecialtyCard";
import { defaultSpecialtyId, specialties } from "@/data/specialties";
import type { IconKind, Specialty as SpecialtyType } from "@/types";

export const Specialty = () => {
  const t = useTranslations("specialty");
  const [active, setActive] = useState<IconKind>(defaultSpecialtyId);

  const items: SpecialtyType[] = specialties.map((s) => ({
    ...s,
    title: t(`items.${s.id}.title`),
    desc: t(`items.${s.id}.desc`),
  }));

  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <SectionHeader
        tag={t("tag")}
        lines={[t("titleLine1"), t("titleLine2")]}
      />
      <div className="mt-16 grid grid-cols-2 gap-5 md:grid-cols-4">
        {items.map((item, i) => (
          <SpecialtyCard
            key={item.id}
            specialty={item}
            index={i}
            isActive={item.id === active}
            onSelect={setActive}
          />
        ))}
      </div>
    </section>
  );
};
