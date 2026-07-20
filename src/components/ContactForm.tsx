"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { hoverColorTransition } from "@/lib/motion";
import { FIELD_CLASS, FIELD_FOCUS } from "@/lib/ui";
import type { ContactFormValues } from "@/types";
import { NeonRotatingBorder } from "./NeonRotatingBorder";
import { PillButton } from "./PillButton";

interface ContactFormProps {
  /** Injected submit handler — keeps this component free of data-fetching. */
  onSubmit: (values: ContactFormValues) => Promise<void> | void;
}

export const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("errors.nameRequired")),
        email: z
          .string()
          .min(1, t("errors.emailRequired"))
          .email(t("errors.emailInvalid")),
        message: z
          .string()
          .min(1, t("errors.messageRequired"))
          .min(10, t("errors.messageMin")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    setSubmitted(true);
    reset();
  });

  const fieldClass = FIELD_CLASS;
  const focusBorder = FIELD_FOCUS;
  const labelClass = "tag-mono mb-2 block uppercase";
  const errorClass = "mt-2 text-[13px] text-danger";

  return (
    <NeonRotatingBorder>
      <form onSubmit={submit} noValidate className="p-7 md:p-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className={labelClass}>
              {t("name.label")}
            </label>
            <motion.input
              id="contact-name"
              type="text"
              autoComplete="name"
              placeholder={t("name.placeholder")}
              aria-invalid={errors.name ? "true" : "false"}
              className={fieldClass}
              whileFocus={focusBorder}
              transition={hoverColorTransition}
              {...register("name")}
            />
            {errors.name && (
              <p className={errorClass}>{errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="contact-email" className={labelClass}>
              {t("email.label")}
            </label>
            <motion.input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder={t("email.placeholder")}
              aria-invalid={errors.email ? "true" : "false"}
              className={fieldClass}
              whileFocus={focusBorder}
              transition={hoverColorTransition}
              {...register("email")}
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="contact-message" className={labelClass}>
            {t("message.label")}
          </label>
          <motion.textarea
            id="contact-message"
            rows={5}
            placeholder={t("message.placeholder")}
            aria-invalid={errors.message ? "true" : "false"}
            className={`${fieldClass} resize-none`}
            whileFocus={focusBorder}
            transition={hoverColorTransition}
            {...register("message")}
          />
          {errors.message && (
            <p className={errorClass}>{errors.message.message}</p>
          )}
        </div>

        <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <PillButton type="submit" variant="light" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
          </PillButton>
          {submitted && (
            <output className="text-[14px] text-accent">{t("success")}</output>
          )}
        </div>
      </form>
    </NeonRotatingBorder>
  );
};
