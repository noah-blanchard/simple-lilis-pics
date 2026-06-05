"use client";

import { useEffect, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { TranslateInput } from "@/lib/api/schemas";
import { useTranslate } from "@/lib/translate/use-translate";
import { TranslateButton, type TranslateButtonState } from "./TranslateButton";

const LANGUAGE_LABELS: Record<TranslateInput["to"], string> = {
  en: "English",
  fr: "French",
};

interface TranslatableFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  /** Renders a textarea instead of a single-line input. */
  multiline?: boolean;
  /** react-hook-form registration for this (target) field. */
  registration: UseFormRegisterReturn;
  /** Shared field/label class strings (single source of truth in the form). */
  fieldClass: string;
  labelClass: string;
  /** Translation direction + content type. */
  from: TranslateInput["from"];
  to: TranslateInput["to"];
  kind: TranslateInput["kind"];
  /** Current value of the source-language field (what gets translated). */
  sourceValue: string;
  /** Current value of this (target) field — drives the overwrite confirm. */
  targetValue: string;
  /** Called with the translated text to write into the target field. */
  onTranslated: (text: string) => void;
}

/** A form field (input or textarea) with an in-corner sparkle button that
 *  translates the sibling-language value into this field via OpenRouter.
 *  Owns the two-click overwrite confirmation and the loading/error UI. */
export function TranslatableField({
  id,
  label,
  placeholder,
  multiline = false,
  registration,
  fieldClass,
  labelClass,
  from,
  to,
  kind,
  sourceValue,
  targetValue,
  onTranslated,
}: TranslatableFieldProps) {
  const [phase, setPhase] = useState<"idle" | "confirm">("idle");
  const mutation = useTranslate();

  const source = sourceValue.trim();
  const hasSource = source.length > 0;
  const targetFilled = targetValue.trim().length > 0;

  // A pending confirm becomes stale as soon as either side changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on value changes
  useEffect(() => {
    setPhase("idle");
  }, [sourceValue, targetValue]);

  const runTranslation = () => {
    setPhase("idle");
    mutation.mutate(
      { text: source, from, to, kind },
      { onSuccess: ({ translation }) => onTranslated(translation) },
    );
  };

  const handleClick = () => {
    if (!hasSource || mutation.isPending) return;
    if (targetFilled && phase === "idle") {
      setPhase("confirm");
      return;
    }
    runTranslation();
  };

  const state: TranslateButtonState = mutation.isPending
    ? "loading"
    : phase === "confirm"
      ? "confirm"
      : "idle";

  const buttonTitle = hasSource
    ? `Translate from ${LANGUAGE_LABELS[from]}`
    : `Fill the ${LANGUAGE_LABELS[from]} ${kind} first`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            rows={3}
            placeholder={placeholder}
            className={`${fieldClass} resize-none pr-11`}
            {...registration}
          />
        ) : (
          <input
            id={id}
            type="text"
            placeholder={placeholder}
            className={`${fieldClass} pr-11`}
            {...registration}
          />
        )}
        <div className="absolute top-2 right-2">
          <TranslateButton
            state={state}
            disabled={!hasSource}
            title={buttonTitle}
            onClick={handleClick}
          />
        </div>
      </div>

      {phase === "confirm" && (
        <p className="mt-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[12px] text-amber-300">
          This will overwrite the current {LANGUAGE_LABELS[to]} {kind}. Click
          the sparkle again to confirm.
        </p>
      )}

      {mutation.isError && (
        <p className="mt-1.5 text-[12px] text-red-400">
          {(mutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
