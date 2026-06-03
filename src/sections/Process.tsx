"use client";

import { useScroll } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ProcessCard } from "@/components/ProcessCard";
import { ProcessRow } from "@/components/ProcessRow";
import { SectionHeader } from "@/components/SectionHeader";
import { defaultProcessStep, processSteps } from "@/data/process";
import type { ProcessStep } from "@/types";

// Collapsed-header height in px. Also the sticky `top` stagger, so a covered
// card shows exactly its header strip and nothing more.
const HEADER_H = 88;

export const Process = () => {
  const t = useTranslations("process");

  const steps: ProcessStep[] = processSteps.map((s) => ({
    ...s,
    title: t(`steps.${s.n}.title`),
    body: t(`steps.${s.n}.body`),
    bullets: t.raw(`steps.${s.n}.bullets`) as string[],
  }));

  // Desktop: scroll progress across the stacked cards drives the depth cues.
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  // Mobile fallback: the original click accordion.
  const [openId, setOpenId] = useState<string | null>(defaultProcessStep);

  return (
    <section id="process" className="px-6 py-24 md:px-12 md:py-32">
      <SectionHeader
        tag={t("tag")}
        lines={[t("titleLine1"), t("titleLine2")]}
      />

      {/* Desktop — sticky stacking cards driven by scroll. */}
      <div
        ref={stackRef}
        className="mx-auto mt-14 hidden max-w-[1100px] md:block"
      >
        {steps.map((step, index) => (
          <ProcessCard
            key={step.n}
            step={step}
            index={index}
            total={steps.length}
            progress={scrollYProgress}
            headerH={HEADER_H}
          />
        ))}
      </div>

      {/* Mobile — simple click accordion (sticky/pin behaves poorly on small screens). */}
      <div className="mx-auto mt-14 max-w-[1100px] space-y-4 md:hidden">
        {steps.map((step) => (
          <ProcessRow
            key={step.n}
            step={step}
            open={openId === step.n}
            onToggle={() => setOpenId(openId === step.n ? null : step.n)}
          />
        ))}
      </div>
    </section>
  );
};
