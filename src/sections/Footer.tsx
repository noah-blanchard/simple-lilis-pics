import { useTranslations } from "next-intl";
import { HoverLink } from "@/components/HoverLink";
import { PillButton } from "@/components/PillButton";
import { Reveal } from "@/components/Reveal";
import { RoundedImage } from "@/components/RoundedImage";
import { rawList } from "@/lib/messages";

const FOOTER_IMG_1 =
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80&auto=format&fit=crop";
const FOOTER_IMG_2 =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80&auto=format&fit=crop";

export const Footer = () => {
  const t = useTranslations("footer");
  const sitemap = rawList(t, "sitemap");
  const social = rawList(t, "social");

  return (
    <footer className="relative overflow-hidden px-6 pt-24 pb-10 md:px-12 md:pt-32">
      {/* big CTA */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2
            className="display text-3xl tracking-tight md:text-5xl lg:text-[56px]"
            style={{ textWrap: "balance" }}
          >
            <span className="text-fg">{t("ctaBase")}</span>
            <span className="text-accent">{t("ctaAccent")}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5 lg:flex lg:justify-end">
          <PillButton href="#contact" variant="light">
            {t("getInTouch")}
          </PillButton>
        </Reveal>
      </div>

      {/* photo + nav row */}
      <div className="mt-20 grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-6">
        <div className="space-y-2 md:col-span-3">
          <div className="tag-mono mb-4 text-fg/35 uppercase">
            {t("sitemapLabel")}
          </div>
          {sitemap.map((label) => (
            <a
              key={label}
              href="#"
              className="block text-[15px] text-fg/80 uppercase tracking-wide hover:text-accent"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5 md:col-span-6">
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
        </div>
      </div>

      {/* bottom bar */}
      <div className="mt-16 flex flex-col items-start justify-between gap-6 border-line border-t pt-8 md:flex-row md:items-center">
        <div className="text-[14px] text-fg/55">{t("copyright")}</div>
        <div className="flex gap-3">
          {social.map((label) => (
            <HoverLink
              key={label}
              href="#"
              className="rounded-full bg-panel px-5 py-2.5 text-[13px] text-fg/80"
              whileHover={{
                backgroundColor: "var(--inverse)",
                color: "var(--on-inverse)",
              }}
            >
              {label}
            </HoverLink>
          ))}
        </div>
      </div>

      {/* watermark text */}
      <div className="pointer-events-none mt-16 select-none overflow-hidden md:mt-24">
        <div className="wm-text whitespace-nowrap text-center text-[20vw] md:text-[18vw]">
          {t("watermark")}
        </div>
      </div>
    </footer>
  );
};
