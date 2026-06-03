import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { RoundedImage } from "@/components/RoundedImage";
import { SectionHeader } from "@/components/SectionHeader";

const ABOUT_IMG_1 =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80&auto=format&fit=crop";
const ABOUT_IMG_2 =
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900&q=80&auto=format&fit=crop";

export const About = () => {
  const t = useTranslations("about");

  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <SectionHeader
        tag={t("tag")}
        lines={[t("titleLine1"), t("titleLine2")]}
      />
      <div className="mt-16 grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <RoundedImage
            ratio="aspect-[4/5]"
            src={ABOUT_IMG_1}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-4">
          <RoundedImage
            ratio="aspect-[4/5]"
            src={ABOUT_IMG_2}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Reveal>
        <Reveal delay={0.2} className="flex flex-col justify-end md:col-span-4">
          <p className="max-w-[420px] text-[15px] text-white/75 leading-relaxed md:text-[16px]">
            {t("body")}
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 text-white transition-colors hover:text-accent"
          >
            <span className="font-medium">{t("readMore")}</span>
            <span aria-hidden>→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
};
