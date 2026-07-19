import { useTranslations } from "next-intl";
import { ProcessFilmstrip } from "@/components/process/ProcessFilmstrip";
import { ProcessFrame } from "@/components/process/ProcessFrame";
import { SectionHeader } from "@/components/SectionHeader";
import { processSteps } from "@/data/process";
import { rawList } from "@/lib/messages";
import type { ProcessStep } from "@/types";

export const Process = () => {
  const t = useTranslations("process");

  const steps: ProcessStep[] = processSteps.map((s) => ({
    ...s,
    title: t(`steps.${s.n}.title`),
    body: t(`steps.${s.n}.body`),
    bullets: rawList(t, `steps.${s.n}.bullets`),
  }));

  return (
    <section id="process" className="px-6 py-24 md:px-12 md:py-32">
      <SectionHeader
        tag={t("tag")}
        titleBase={t("titleBase")}
        titleAccent={t("titleAccent")}
      />

      {/* Desktop — sticky "develop" stage + scrolling steps. */}
      <ProcessFilmstrip steps={steps} />

      {/* Mobile — the filmstrip unrolled into a vertical stack. */}
      <div className="mx-auto mt-12 max-w-[520px] space-y-12 md:hidden">
        {steps.map((step, index) => (
          <ProcessFrame
            key={step.n}
            step={step}
            connect={index < steps.length - 1}
          />
        ))}
      </div>
    </section>
  );
};
