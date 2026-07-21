import { useTranslations } from "next-intl";
import { HoverLink } from "@/components/HoverLink";
import { Reveal } from "@/components/Reveal";
import { RoundedImage } from "@/components/RoundedImage";
import { SectionHeader } from "@/components/SectionHeader";

const ABOUT_IMG = "/about/about_landscape.webp";

export const About = () => {
  const t = useTranslations("about");

  return (
    <section id="about" className="container-site section-y">
      <SectionHeader
        tag={t("tag")}
        titleBase={t("titleBase")}
        titleAccent={t("titleAccent")}
      />
      <div className="mt-16 grid grid-cols-1 items-stretch gap-6 md:grid-cols-12 2xl:mt-24">
        <Reveal className="md:col-span-8">
          <RoundedImage
            ratio="aspect-[16/9]"
            src={ABOUT_IMG}
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col justify-end md:col-span-4">
          <p className="max-w-[420px] text-[15px] text-fg/75 leading-relaxed md:text-[16px] min-[1440px]:text-body-fluid">
            {t("body")}
          </p>
          <HoverLink
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 text-fg"
            whileHover={{ color: "var(--accent-strong)" }}
          >
            <span className="font-medium">{t("readMore")}</span>
            <span aria-hidden>→</span>
          </HoverLink>
        </Reveal>
      </div>
    </section>
  );
};
