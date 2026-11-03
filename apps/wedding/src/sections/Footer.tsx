import { AccentUnderline } from "@lili/ui/components/AccentUnderline";
import { PillButton } from "@lili/ui/components/PillButton";
import { Reveal } from "@lili/ui/components/Reveal";
import { getLocale, getTranslations } from "next-intl/server";
import { HoverLink } from "@/components/HoverLink";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Tone } from "@/components/Tone";
import { INSTAGRAM_HREF, portfolioHref } from "@/data/nav";
import { getPathname, Link } from "@/i18n/navigation";

// Night footer: the closing line and the reply button, then contact details.
export const Footer = async () => {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <Tone
      tone="night"
      as="footer"
      id="footer"
      className="relative overflow-hidden"
    >
      <div className="container-site pt-24 pb-10 md:pt-32 2xl:pt-40">
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2
                className="display text-3xl tracking-tight md:text-5xl lg:text-[56px] min-[1440px]:text-h2f-fluid"
                style={{ textWrap: "balance" }}
              >
                <span className="text-fg">{t("titleBase")}</span>{" "}
                <AccentUnderline className="text-accent italic">
                  {t("titleAccent")}
                </AccentUnderline>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:flex lg:justify-end">
              <PillButton
                variant="light"
                href={getPathname({ href: "/rsvp", locale })}
              >
                {t("cta")}
              </PillButton>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-12">
            <p className="text-muted italic md:col-span-4">
              {t("availability")}
            </p>
            <div className="flex flex-col gap-1 md:col-span-4">
              <HoverLink
                href={`mailto:${tNav("email")}`}
                className="text-[15px] text-fg/80"
              >
                {tNav("email")}
              </HoverLink>
              <HoverLink
                href={INSTAGRAM_HREF}
                target="_blank"
                className="text-[15px] text-fg/80"
              >
                {t("instagram")}
              </HoverLink>
            </div>
            <div className="flex flex-col gap-1 md:col-span-4">
              <HoverLink
                href={portfolioHref(locale)}
                target="_blank"
                className="text-[15px] text-fg/80"
              >
                {t("portfolio")}
              </HoverLink>
              <Link href="/privacy" className="text-[15px] text-fg/80">
                {t("privacy")}
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col gap-6 border-line border-t pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px] text-muted">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="self-start">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </Tone>
  );
};
