"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/routing";
import { apiFetch } from "@/lib/api/client";
import { EASE, hoverColorTransition } from "@/lib/motion";
import { RATED_STORAGE_KEY } from "@/lib/rating";
import { FIELD_CLASS, FIELD_FOCUS } from "@/lib/ui";
import { PillButton } from "../PillButton";
import { RateSuccess } from "./RateSuccess";
import { StarRating } from "./StarRating";

interface RateExperienceProps {
  token: string;
  locale: Locale;
}

/**
 * The rating page itself. Deliberately minimal: the stars are the only required
 * input, and the note + name stay hidden behind a text button so the fast path
 * is scan → tap → send. No react-hook-form here — there is one required field
 * and it isn't a text input, so a `useState` triple is less machinery than a
 * resolver would be.
 */
export const RateExperience = ({ token, locale }: RateExperienceProps) => {
  const t = useTranslations("rate");

  const [stars, setStars] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);

  // A token is single-use, so a revisit (back button, re-scan on the same
  // phone) should land on the thank-you rather than an empty form it can no
  // longer submit.
  useEffect(() => {
    if (localStorage.getItem(RATED_STORAGE_KEY) === token) setSubmitted(true);
  }, [token]);

  const submit = async () => {
    if (stars === 0 || submitting) return;
    setSubmitting(true);
    setFailed(false);
    try {
      await apiFetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, stars, note, name, company }),
      });
      localStorage.setItem(RATED_STORAGE_KEY, token);
      setSubmitted(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
          className="w-full max-w-[420px]"
        >
          <RateSuccess stars={stars} locale={locale} />
        </motion.div>
      ) : (
        <motion.div
          key="form"
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="w-full max-w-[420px]"
        >
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-center font-display text-[34px] leading-tight"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="mt-2 text-center text-[15px] text-fg/55"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
            className="mt-10"
          >
            <StarRating value={stars} onChange={setStars} />
          </motion.div>

          {/* Honeypot — invisible to sighted users and screen readers alike.
              The server pretends to succeed when it is filled. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor="rate-company">Company</label>
            <input
              id="rate-company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
          </div>

          <div className="mt-8">
            <AnimatePresence initial={false}>
              {noteOpen && (
                <motion.div
                  key="note"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="pb-5">
                    <label htmlFor="rate-note" className="sr-only">
                      {t("note.label")}
                    </label>
                    <motion.textarea
                      id="rate-note"
                      rows={3}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder={t("note.placeholder")}
                      className={`${FIELD_CLASS} resize-none`}
                      whileFocus={FIELD_FOCUS}
                      transition={hoverColorTransition}
                    />
                    <label htmlFor="rate-name" className="sr-only">
                      {t("name.label")}
                    </label>
                    <motion.input
                      id="rate-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t("name.placeholder")}
                      className={`${FIELD_CLASS} mt-3`}
                      whileFocus={FIELD_FOCUS}
                      transition={hoverColorTransition}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setNoteOpen((open) => !open)}
                className="cursor-pointer text-[14px] text-fg/50 underline underline-offset-4"
              >
                {noteOpen ? t("hideNote") : t("addNote")}
              </button>
            </div>
          </div>

          {/* The submit only exists once there is something to submit — it is
              the page's single next step, so it shouldn't sit there greyed out
              while the stars are still empty. */}
          <AnimatePresence initial={false}>
            {stars > 0 && (
              <motion.div
                key="submit"
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 12, height: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="flex flex-col items-center pt-8">
                  <PillButton
                    variant="light"
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting ? t("submitting") : t("submit")}
                  </PillButton>
                  {failed && (
                    <p
                      role="alert"
                      className="mt-3 text-center text-[13px] text-danger"
                    >
                      {t("errors.submitFailed")}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
