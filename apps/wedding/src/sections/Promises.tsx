import type { Locale } from "@lili/core/i18n/routing";
import { Reveal } from "@lili/ui/components/Reveal";
import { getTranslations } from "next-intl/server";
import { Rule } from "@/components/Rule";
import { Tone } from "@/components/Tone";
import { rawItems } from "@/lib/messages";

interface PromiseItem {
  title: string;
  line: string;
}

// No visible header: the three vows are the opener (D9).
export const Promises = async ({ locale }: { locale: Locale }) => {
  const t = await getTranslations({ locale, namespace: "promises" });
  const items = rawItems<PromiseItem>(t, "items");

  return (
    <Tone
      tone="day"
      as="section"
      id="promises"
      aria-labelledby="promises-title"
      className="section-y"
    >
      <h2 id="promises-title" className="sr-only">
        {t("heading")}
      </h2>
      <div className="container-site">
        <ul className="mx-auto flex max-w-3xl flex-col items-center gap-10 text-center">
          {items.map((item, i) => (
            <li key={item.title}>
              <Reveal delay={i * 0.08}>
                {i > 0 ? <Rule className="mb-10" /> : null}
                <p className="display text-[clamp(30px,3.6vw,48px)] leading-[1.08]">
                  {item.title}
                </p>
                <p className="mx-auto mt-3 max-w-[30em] text-body-fluid text-muted">
                  {item.line}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal>
          <p className="mx-auto mt-16 max-w-[34em] text-center text-muted italic">
            {t("coverage")}
          </p>
        </Reveal>
      </div>
    </Tone>
  );
};
