import type { Locale } from "@lili/core/i18n/routing";
import { Reveal } from "@lili/ui/components/Reveal";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { getTranslations } from "next-intl/server";
import { Rule } from "@/components/Rule";
import { Sheet } from "@/components/Sheet";
import { Tone } from "@/components/Tone";
import { rawItems } from "@/lib/messages";

interface Step {
  when: string;
  what: string;
  why: string;
}

// The process as a printed order of service. The card heading is this
// section's one capitals line; "when" lines are cyanotype ink (D6).
export const OrderOfService = async ({ locale }: { locale: Locale }) => {
  const t = await getTranslations({ locale, namespace: "process" });
  const steps = rawItems<Step>(t, "steps");

  return (
    <Tone
      tone="night"
      as="section"
      id="process"
      aria-labelledby="process-title"
      className="section-y"
    >
      <div className="container-site">
        <SectionHeader
          id="process-title"
          titleBase={t("titleBase")}
          titleAccent={t("titleAccent")}
        />
        <Reveal className="mt-14">
          <Sheet
            keyline
            className="mx-auto max-w-[640px] px-8 py-14 text-center sm:px-14 md:py-20"
          >
            <p className="font-display text-[15px] uppercase tracking-[0.08em]">
              {t("cardHeading")}
            </p>
            <ol className="mt-10 flex list-none flex-col items-center gap-6">
              {steps.map((step, i) => (
                <li
                  key={step.what}
                  className="flex flex-col items-center gap-1"
                >
                  {i > 0 ? <Rule short className="mb-5" /> : null}
                  <p className="text-[16px] text-cyanotype italic">
                    {step.when}
                  </p>
                  <p className="display text-[clamp(24px,2.4vw,28px)] leading-[1.1]">
                    {step.what}
                  </p>
                  <p className="max-w-[28em] text-[15px] text-muted">
                    {step.why}
                  </p>
                </li>
              ))}
            </ol>
          </Sheet>
        </Reveal>
      </div>
    </Tone>
  );
};
