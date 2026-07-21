import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { About } from "@/sections/About";
import { Contact } from "@/sections/Contact";
import { Featured } from "@/sections/Featured";
import { Footer } from "@/sections/Footer";
import { Hero } from "@/sections/Hero";
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
  return (
    <main className="bg-ink text-fg">
      <Hero />
      <About />
      <Specialty />
      <Featured />
      <Process />
      {/* <Testimonials /> */}
      <Contact />
      <Footer />
    </main>
  );
}
