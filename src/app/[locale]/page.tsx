import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Marquee } from "@/components/Marquee";
import { About } from "@/sections/About";
import { Contact } from "@/sections/Contact";
import { Footer } from "@/sections/Footer";
import { Hero } from "@/sections/Hero";
import { Portfolio } from "@/sections/Portfolio";
import { Pricing } from "@/sections/Pricing";
import { Process } from "@/sections/Process";
import { Specialty } from "@/sections/Specialty";
import { Testimonials } from "@/sections/Testimonials";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  // Opt into static rendering for this locale before reading translations.
  setRequestLocale(locale);

  return <HomeSections />;
}

function HomeSections() {
  const tMarquee = useTranslations("marquee");

  return (
    <main className="bg-ink text-white">
      <Hero />
      {/* <Marquee items={tMarquee.raw("items") as string[]} /> */}
      <About />
      <Specialty />
      <Portfolio />
      <Process />
      <Pricing />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
