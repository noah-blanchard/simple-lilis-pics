"use client";

import { useTranslations } from "next-intl";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import type { ContactFormValues } from "@/types";

export const Contact = () => {
  const t = useTranslations("contact");

  // Mock async submission. Swap for a real mutation (e.g. TanStack Query) later
  // without touching the dumb ContactForm component.
  const handleSubmit = async (_values: ContactFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  return (
    <section id="contact" className="px-6 py-24 md:px-12 md:py-32">
      <SectionHeader
        tag={t("tag")}
        lines={[t("titleLine1"), t("titleLine2")]}
      />
      <Reveal delay={0.1} className="mx-auto mt-12 max-w-[820px]">
        <p className="mb-8 text-center text-[15px] text-white/65 leading-relaxed">
          {t("description")}
        </p>
        <ContactForm onSubmit={handleSubmit} />
      </Reveal>
    </section>
  );
};
