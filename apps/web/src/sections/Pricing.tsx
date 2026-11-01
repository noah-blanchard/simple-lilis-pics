import { useTranslations } from "next-intl";
import { PriceCard } from "@/components/PriceCard";
import { Reveal } from "@/components/Reveal";
import { plans } from "@/data/plans";
import { rawList } from "@/lib/messages";
import type { Plan } from "@/types";

export const Pricing = () => {
  const t = useTranslations("pricing");

  const items: Plan[] = plans.map((p) => ({
    ...p,
    name: t(`plans.${p.id}.name`),
    blurb: t(`plans.${p.id}.blurb`),
    unit: t(`plans.${p.id}.unit`),
    includes: rawList(t, `plans.${p.id}.includes`),
  }));

  return (
    <section id="pricing" className="container-site section-y">
      <div className="mb-14 grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <h2
            className="display text-4xl md:text-5xl lg:text-6xl"
            style={{ textWrap: "balance" }}
          >
            {t("title")}
          </h2>
        </Reveal>
        <Reveal
          delay={0.1}
          className="max-w-[520px] text-[15px] text-fg/65 leading-relaxed lg:col-span-7 lg:pl-10"
        >
          {t("description")}
        </Reveal>
      </div>
      <div className="space-y-6">
        {items.map((plan, i) => (
          <PriceCard
            key={plan.id}
            plan={plan}
            index={i}
            includesLabel={t("includesLabel")}
            ctaLabel={t("cta")}
          />
        ))}
      </div>
    </section>
  );
};
