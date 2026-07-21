import { useTranslations } from "next-intl";
import { AccentUnderline } from "@/components/AccentUnderline";
import { FooterContactCta } from "@/components/FooterContactCta";
import { FooterSitemapLinks } from "@/components/FooterSitemapLinks";
import { HoverLink } from "@/components/HoverLink";
import { Reveal } from "@/components/Reveal";
import { socials } from "@/data/socials";

export const Footer = () => {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="container-site relative overflow-hidden pt-24 pb-10 md:pt-32 2xl:pt-40">
      {/* big CTA */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2
            className="display text-3xl tracking-tight md:text-5xl lg:text-[56px] min-[1440px]:text-h2f-fluid"
            style={{ textWrap: "balance" }}
          >
            <span className="text-fg">{t("ctaBase")}</span>{" "}
            <AccentUnderline className="text-accent italic">
              {t("ctaAccent")}
            </AccentUnderline>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5 lg:flex lg:justify-end">
          <FooterContactCta />
        </Reveal>
      </div>

      {/* photo + nav row */}
      <div className="mt-20 grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-6">
        <div className="space-y-2 md:col-span-3">
          <div className="tag-mono mb-4 text-fg/35 uppercase">
            {t("sitemapLabel")}
          </div>
          <FooterSitemapLinks />
        </div>
        {/* <div className="grid grid-cols-2 gap-5 md:col-span-6">
          <RoundedImage
            src={FOOTER_IMG_1}
            ratio="aspect-[4/5]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <RoundedImage
            src={FOOTER_IMG_2}
            ratio="aspect-[4/5]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div> */}
      </div>

      {/* bottom bar */}
      <div className="mt-16 flex flex-col items-start justify-between gap-6 border-line border-t pt-8 md:flex-row md:items-center">
        <div className="text-[14px] text-fg/55">{t("copyright")}</div>
        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-wrap">
          {socials.map((s) => (
            <HoverLink
              key={s.label}
              href={s.href}
              target="_blank"
              className="rounded-full bg-panel px-5 py-2.5 text-center text-[13px] text-fg/80"
              whileHover={{
                backgroundColor: "var(--inverse)",
                color: "var(--on-inverse)",
              }}
            >
              {s.label}
            </HoverLink>
          ))}
          <HoverLink
            href="/admin"
            className="rounded-full bg-panel px-5 py-2.5 text-center text-[13px] text-fg/80"
            whileHover={{
              backgroundColor: "var(--inverse)",
              color: "var(--on-inverse)",
            }}
          >
            {tNav("dashboard")}
          </HoverLink>
        </div>
      </div>

      {/* watermark text
      <div className="pointer-events-none mt-16 select-none overflow-hidden md:mt-24">
        <div className="wm-text whitespace-nowrap text-center text-[20vw] md:text-[18vw]">
          {t("watermark")}
        </div>
      </div> */}
    </footer>
  );
};
