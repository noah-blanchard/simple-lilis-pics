"use client";

import { motion } from "motion/react";
import { IconSparkle } from "@/components/Icons";

export type TranslateButtonState = "idle" | "confirm" | "loading";

interface TranslateButtonProps {
  state: TranslateButtonState;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}

/** Dumb sparkle button shown inside a translatable field. The parent owns
 *  positioning and the state machine; this only renders the right visual per
 *  state (idle / confirm = amber / loading = spinner). */
export function TranslateButton({
  state,
  disabled = false,
  title,
  onClick,
}: TranslateButtonProps) {
  const color =
    state === "confirm" ? "text-amber-400" : "text-fg/40 hover:text-accent";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || state === "loading"}
      title={title}
      aria-label={title}
      className={`grid h-7 w-7 cursor-pointer place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${color}`}
    >
      {state === "loading" ? (
        <motion.span
          className="block h-3.5 w-3.5 rounded-full border-[1.5px] border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, ease: "linear", repeat: Infinity }}
        />
      ) : (
        <IconSparkle className="h-4 w-4" />
      )}
    </button>
  );
}
