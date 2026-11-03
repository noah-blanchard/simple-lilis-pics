"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@lili/core/api/client";
import {
  BUDGET_RANGES,
  GUEST_RANGES,
  INQUIRY_COLLECTIONS,
} from "@lili/core/api/schemas";
import type { Locale } from "@lili/core/i18n/routing";
import { WaxSeal } from "@lili/ui/components/WaxSeal";
import { hoverRevealTransition } from "@lili/ui/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "@/i18n/navigation";
import { SealedEnvelope } from "./SealedEnvelope";
import { Sheet } from "./Sheet";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    className: string;
  }) => ReactNode;
}

const CONTROL =
  "mt-1 w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 pt-1 pb-1.5 font-display text-[22px] text-fg outline-none focus-visible:border-cyanotype focus-visible:shadow-[0_1px_0_var(--cyanotype)]";

/** Ruled-line field: italic label, one ruled-line control, error text. */
const Field = ({ id, label, error, className = "", children }: FieldProps) => (
  <div className={className}>
    <label htmlFor={id} className="block text-[15px] text-muted italic">
      {label}
    </label>
    {children({
      id,
      "aria-invalid": Boolean(error),
      "aria-describedby": error ? `${id}-error` : undefined,
      className: CONTROL,
    })}
    {error ? (
      <p id={`${id}-error`} className="mt-1.5 text-[14px] text-wax italic">
        {error}
      </p>
    ) : null}
  </div>
);

const Chevron = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 10 6"
    className="pointer-events-none absolute right-0 bottom-3 h-[6px] w-[10px] text-muted"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.4}
  >
    <path d="M1 1l4 4 4-4" />
  </svg>
);

export const ReplyCard = () => {
  const t = useTranslations("reply");
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const startedAt = useRef(Date.now());
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState(false);

  const schema = useMemo(() => {
    const required = t("errors.required");
    return z
      .object({
        names: z.string().trim().min(1, required),
        email: z.string().trim().min(1, required).email(t("errors.email")),
        wedding_date: z.string(),
        date_unset: z.boolean(),
        venue: z.string().trim().min(1, required),
        guests: z.string(),
        collection: z.string(),
        budget: z.string(),
        heard_from: z.string(),
        message: z.string(),
        consent: z.boolean().refine((v) => v, t("errors.consent")),
        company: z.string().optional(),
      })
      .refine((d) => d.wedding_date !== "" || d.date_unset, {
        path: ["wedding_date"],
        message: t("errors.date"),
      });
  }, [t]);
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    // Focus is moved by hand below: fields register out of visual order here.
    shouldFocusError: false,
    defaultValues: {
      names: "",
      email: "",
      wedding_date: "",
      date_unset: false,
      venue: "",
      guests: "",
      collection: "",
      budget: "",
      heard_from: "",
      message: "",
      consent: false,
      company: "",
    },
  });
  const dateUnset = watch("date_unset");

  const submit = handleSubmit(
    async (v) => {
      setServerError(false);
      try {
        await apiFetch<{ id: string }>("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            names: v.names,
            email: v.email,
            wedding_date:
              v.date_unset || !v.wedding_date ? null : v.wedding_date,
            date_unset: v.date_unset,
            venue: v.venue,
            guests: v.guests || null,
            collection: v.collection || null,
            budget: v.budget || null,
            heard_from: v.heard_from,
            message: v.message,
            consent: true,
            locale,
            company: v.company ?? "",
            started_at: startedAt.current,
          }),
        });
        setSent(true);
      } catch {
        setServerError(true);
      }
    },
    () => {
      // Move focus to the first invalid field in page order.
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>('form [aria-invalid="true"]')
          ?.focus(),
      );
    },
  );

  const onReset = () => {
    reset();
    startedAt.current = Date.now();
    setServerError(false);
    setSent(false);
  };

  if (sent) {
    return (
      <SealedEnvelope
        title={t("success.title")}
        message={t("success.message")}
        cardHeading={t("cardHeading")}
        resetLabel={t("success.reset")}
        locale={locale}
        onReset={onReset}
      />
    );
  }

  const select = (
    name: "guests" | "collection" | "budget",
    options: readonly string[],
    optionKey: string,
  ) => (
    <Field id={name} label={t(`fields.${name}`)} error={errors[name]?.message}>
      {(props) => (
        <div className="relative">
          <select
            {...props}
            {...register(name)}
            className={`${props.className} appearance-none pr-6`}
          >
            <option value="">{t("fields.choose")}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {t(`options.${optionKey}.${o}`)}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
      )}
    </Field>
  );

  return (
    <Sheet keyline className="px-7 py-12 sm:px-12 md:px-16 md:py-16">
      <header className="text-center">
        <p className="font-display text-[15px] uppercase tracking-[0.08em]">
          {t("cardHeading")}
        </p>
        <p className="mt-1 text-[15px] text-muted italic">{t("cardNote")}</p>
      </header>
      <form
        onSubmit={submit}
        noValidate
        className="mt-10 grid gap-x-10 gap-y-7 md:grid-cols-2"
      >
        <Field
          id="names"
          label={t("fields.names")}
          error={errors.names?.message}
          className="md:col-span-2"
        >
          {(props) => (
            <input {...props} {...register("names")} autoComplete="name" />
          )}
        </Field>
        <Field
          id="email"
          label={t("fields.email")}
          error={errors.email?.message}
        >
          {(props) => (
            <input
              {...props}
              {...register("email")}
              type="email"
              autoComplete="email"
            />
          )}
        </Field>
        <div>
          <Field
            id="wedding_date"
            label={t("fields.date")}
            error={errors.wedding_date?.message}
          >
            {(props) => (
              <input
                {...props}
                {...register("wedding_date")}
                type="date"
                disabled={dateUnset}
              />
            )}
          </Field>
          <label className="mt-3 flex items-center gap-3 text-[15px] text-muted italic">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--cyanotype)]"
              {...register("date_unset", {
                onChange: (e) => {
                  if (e.target.checked) setValue("wedding_date", "");
                },
              })}
            />
            {t("fields.dateUnset")}
          </label>
        </div>
        <Field
          id="venue"
          label={t("fields.venue")}
          error={errors.venue?.message}
        >
          {(props) => <input {...props} {...register("venue")} />}
        </Field>
        {select("guests", GUEST_RANGES, "guests")}
        {select("collection", INQUIRY_COLLECTIONS, "collection")}
        {select("budget", BUDGET_RANGES, "budget")}
        <Field
          id="heard_from"
          label={t("fields.heard")}
          error={errors.heard_from?.message}
          className="md:col-span-2"
        >
          {(props) => <input {...props} {...register("heard_from")} />}
        </Field>
        <Field
          id="message"
          label={t("fields.message")}
          error={errors.message?.message}
          className="md:col-span-2"
        >
          {(props) => (
            <textarea
              {...props}
              {...register("message")}
              rows={4}
              className={`${props.className} resize-y`}
            />
          )}
        </Field>

        <div className="md:col-span-2">
          <label className="flex items-start gap-3 text-[15px] text-muted italic">
            <input
              type="checkbox"
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? "consent-error" : undefined}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--cyanotype)]"
              {...register("consent")}
            />
            <span>
              {t.rich("fields.consent", {
                link: (chunks) => (
                  <Link href="/privacy" className="text-fg">
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </label>
          {errors.consent ? (
            <p
              id="consent-error"
              className="mt-1.5 text-[14px] text-wax italic"
            >
              {errors.consent.message}
            </p>
          ) : null}
        </div>

        {/* Honeypot: real visitors never see or fill this field. */}
        <div aria-hidden className="sr-only">
          <input tabIndex={-1} autoComplete="off" {...register("company")} />
        </div>

        {serverError ? (
          <p
            role="alert"
            className="text-center text-[15px] text-wax italic md:col-span-2"
          >
            {t("errors.server")}
          </p>
        ) : null}

        <div className="md:col-span-2">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={reduce ? undefined : "hover"}
            initial="rest"
            animate="rest"
            className="mx-auto mt-4 flex min-h-11 cursor-pointer items-center gap-4 font-display text-[21px] text-fg italic disabled:opacity-60"
          >
            <motion.span
              variants={{
                rest: { rotate: 0, scale: 1 },
                hover: { rotate: -8, scale: 1.05 },
              }}
              transition={hoverRevealTransition}
              className="block h-16 w-16"
            >
              <WaxSeal className="h-full w-full" idSuffix="-reply-button" />
            </motion.span>
            <span>{isSubmitting ? t("sending") : t("submit")}</span>
          </motion.button>
        </div>
      </form>
    </Sheet>
  );
};
