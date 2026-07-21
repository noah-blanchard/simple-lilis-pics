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
    <section id="contact" className="container-site section-y">
      <SectionHeader
        tag={t("tag")}
        titleBase={t("titleBase")}
        titleAccent={t("titleAccent")}
      />
      <Reveal
        delay={0.1}
        className="mx-auto mt-12 max-w-[820px] 2xl:max-w-[920px]"
      >
        <p className="mb-8 text-center text-[15px] text-fg/65 leading-relaxed min-[1440px]:text-body-fluid">
          {t("description")}
        </p>
        <ContactForm onSubmit={handleSubmit} />
      </Reveal>
    </section>
  );
};
