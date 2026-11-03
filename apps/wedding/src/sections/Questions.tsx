import type { Locale } from "@lili/core/i18n/routing";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { getTranslations } from "next-intl/server";
import { FaqItem } from "@/components/FaqItem";
import { Tone } from "@/components/Tone";
import { rawItems } from "@/lib/messages";

interface Group {
  title: string;
  items: { q: string; a: string }[];
}

// The group names are the section's only capitals: they divide a printed list.
export const Questions = async ({ locale }: { locale: Locale }) => {
  const t = await getTranslations({ locale, namespace: "questions" });
  const groups = rawItems<Group>(t, "groups");

  return (
    <Tone
      tone="night"
      as="section"
      id="questions"
      aria-labelledby="questions-title"
      className="section-y"
    >
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              align="left"
              id="questions-title"
              titleBase={t("titleBase")}
              titleAccent={t("titleAccent")}
            />
          </div>
        </div>
        <div className="lg:col-span-8">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="mt-14 mb-3 font-display text-[14px] text-muted uppercase tracking-[0.08em] first:mt-0">
                {group.title}
              </h3>
              <ul className="list-none border-line border-t">
                {group.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Tone>
  );
};
