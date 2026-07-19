"use client";

import { useEffect, useState } from "react";
import type { TranslateInput } from "@/lib/api/schemas";
import { useTranslate } from "@/lib/translate/use-translate";
import { TranslateButton, type TranslateButtonState } from "./TranslateButton";

const LANGUAGE_LABELS: Record<TranslateInput["to"], string> = {
  en: "English",
  fr: "French",
};

interface TranslatableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className: string;
  ariaLabel?: string;
  /** Translation direction + content type. */
  from: TranslateInput["from"];
  to: TranslateInput["to"];
  kind: TranslateInput["kind"];
  /** Current value of the source-language field (what gets translated). */
  sourceValue: string;
}

/** Controlled-input sibling of TranslatableField (which is react-hook-form
 *  bound) — same sparkle-button translate + two-click overwrite-confirm UX,
 *  for callers that own their own value/onChange (e.g. TagsManager). */
export function TranslatableInput({
  value,
  onChange,
  placeholder,
  className,
  ariaLabel,
  from,
  to,
  kind,
  sourceValue,
}: TranslatableInputProps) {
  const [phase, setPhase] = useState<"idle" | "confirm">("idle");
  const mutation = useTranslate();

  const source = sourceValue.trim();
  const hasSource = source.length > 0;
  const targetFilled = value.trim().length > 0;

  // A pending confirm becomes stale as soon as either side changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on value changes
  useEffect(() => {
    setPhase("idle");
  }, [sourceValue, value]);

  const runTranslation = () => {
    setPhase("idle");
    mutation.mutate(
      { text: source, from, to, kind },
      { onSuccess: ({ translation }) => onChange(translation) },
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
    : `Fill the ${LANGUAGE_LABELS[from]} field first`;

  return (
    <div className="min-w-0 flex-1">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={`${className} pr-8`}
        />
        <div className="-translate-y-1/2 absolute top-1/2 right-0.5">
          <TranslateButton
            state={state}
            disabled={!hasSource}
            title={buttonTitle}
            onClick={handleClick}
          />
        </div>
      </div>

      {phase === "confirm" && (
        <p className="mt-1 text-[11px] text-amber-400">
          Overwrite {LANGUAGE_LABELS[to]}? Click the sparkle again to
          confirm.
        </p>
      )}

      {mutation.isError && (
        <p className="mt-1 text-[11px] text-red-400">
          {(mutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
