"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import type { ProcessStep } from "@/types";
import { IconMinus, IconPlus } from "./Icons";
import { ProcessBadgeTitle, ProcessBody } from "./ProcessParts";
import { RoundedImage } from "./RoundedImage";

interface ProcessRowProps {
  step: ProcessStep;
  open: boolean;
  onToggle: () => void;
}

export const ProcessRow = ({ step, open, onToggle }: ProcessRowProps) => (
  <motion.div
    layout
    transition={{ duration: 0.5, ease: EASE }}
    className={`overflow-hidden rounded-card ${open ? "bg-panel" : "bg-panel/60"}`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left md:px-8"
    >
      <div className="flex min-w-0 items-center gap-5 md:gap-7">
        <ProcessBadgeTitle step={step} />
      </div>
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-panel2 text-fg">
        {open ? (
          <IconMinus className="h-5 w-5" />
        ) : (
          <IconPlus className="h-5 w-5" />
        )}
      </span>
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-6 px-6 pb-8 md:grid-cols-12 md:px-8">
            <div className="flex flex-col justify-between md:col-span-5 md:pl-[68px]">
              <ProcessBody step={step} maxW="max-w-[420px]" />
            </div>
            <div className="md:col-span-7">
              <RoundedImage
                src={step.img}
                alt={step.title}
                ratio="aspect-[16/9]"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);
