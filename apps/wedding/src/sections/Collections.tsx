import type { Locale } from "@lili/core/i18n/routing";
import { Reveal } from "@lili/ui/components/Reveal";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { getTranslations } from "next-intl/server";
import { PlaceCard } from "@/components/PlaceCard";
import { Tone } from "@/components/Tone";
import { COLLECTIONS } from "@/data/collections";
import { rawList } from "@/lib/messages";

export const Collections = async ({ locale }: { locale: Locale }) => {
  const t = await getTranslations({ locale, namespace: "collections" });

  return (
    <Tone
      tone="night"
      as="section"
      id="collections"
      aria-labelledby="collections-title"
      className="section-y"
    >
      <div className="container-site">
        <SectionHeader
          id="collections-title"
          titleBase={t("titleBase")}
          titleAccent={t("titleAccent")}
        />
        <ul className="mx-auto mt-14 grid max-w-[1100px] list-none gap-6 md:grid-cols-3">
          {COLLECTIONS.map((c, i) => (
            <li key={c.key}>
              <Reveal delay={i * 0.08} className="h-full">
                <PlaceCard
                  name={t(`items.${c.key}.name`)}
                  duration={t(`items.${c.key}.duration`)}
                  includes={rawList(t, `items.${c.key}.includes`)}
                  price={c.price}
                  from={t("from")}
                  onRequest={t("onRequest")}
                  locale={locale}
                />
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal>
          <p className="mx-auto mt-10 max-w-[46em] text-center text-muted italic">
            {t("addons")}
          </p>
        </Reveal>
      </div>
    </Tone>
  );
};
