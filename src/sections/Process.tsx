"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProcessRow } from "@/components/ProcessRow";
import { SectionHeader } from "@/components/SectionHeader";
import { defaultProcessStep, processSteps } from "@/data/process";
import type { ProcessStep } from "@/types";

export const Process = () => {
  const t = useTranslations("process");
  const [openId, setOpenId] = useState<string | null>(defaultProcessStep);

  const steps: ProcessStep[] = processSteps.map((s) => ({
    ...s,
    title: t(`steps.${s.n}.title`),
    body: t(`steps.${s.n}.body`),
    bullets: t.raw(`steps.${s.n}.bullets`) as string[],
  }));

  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <SectionHeader
        tag={t("tag")}
        lines={[t("titleLine1"), t("titleLine2")]}
      />
      <div className="mx-auto mt-14 max-w-[1100px] space-y-4">
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
