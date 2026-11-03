import type { Locale } from "@lili/core/i18n/routing";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { getTranslations } from "next-intl/server";
import { HoverLink } from "@/components/HoverLink";
import { ReplyCard } from "@/components/ReplyCard";
import { Tone } from "@/components/Tone";

// The reply card on the table. Used at the end of the home page and on /rsvp.
export const ReplySection = async ({
  locale,
  headingAs = "h2",
}: {
  locale: Locale;
  headingAs?: "h1" | "h2";
}) => {
  const t = await getTranslations({ locale, namespace: "reply" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  // The sentence is one message with an {email} slot; split it around a marker
  // so the address can be a link.
  const aside = t("introAside", { email: "\u0000" }).split("\u0000");

  return (
    <Tone
      tone="night"
      as="section"
      id="reply"
      aria-labelledby="reply-title"
      className="section-y"
    >
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader
            align="left"
            as={headingAs}
            id="reply-title"
            titleBase={t("titleBase")}
            titleAccent={t("titleAccent")}
          />
          <p className="mt-8 max-w-[30em] text-body-fluid text-fg/75">
            {t("intro")}
          </p>
          <p className="mt-4 text-muted">
            {aside[0]}
            <HoverLink href={`mailto:${tNav("email")}`} className="text-fg">
              {tNav("email")}
            </HoverLink>
            {aside[1]}
          </p>
        </div>
        <div className="lg:col-span-8">
          <ReplyCard />
        </div>
      </div>
    </Tone>
  );
};
