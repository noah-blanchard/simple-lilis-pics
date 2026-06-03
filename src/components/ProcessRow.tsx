"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ProcessStep } from "@/types";
import { IconMinus, IconPlus } from "./Icons";
import { RoundedImage } from "./RoundedImage";

interface ProcessRowProps {
  step: ProcessStep;
  open: boolean;
  onToggle: () => void;
}

export const ProcessRow = ({ step, open, onToggle }: ProcessRowProps) => (
  <motion.div
    layout
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={`overflow-hidden rounded-card ${open ? "bg-panel" : "bg-panel/60"}`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left md:px-8"
    >
      <div className="flex min-w-0 items-center gap-5 md:gap-7">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-[15px] font-semibold text-ink">
          {step.n}
        </span>
        <span className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
          {step.title}
        </span>
      </div>
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-panel2 text-white">
        {open ? <IconMinus className="h-5 w-5" /> : <IconPlus className="h-5 w-5" />}
      </span>
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-6 px-6 pb-8 md:grid-cols-12 md:px-8">
            <div className="flex flex-col justify-between md:col-span-5 md:pl-[68px]">
              <p className="max-w-[420px] text-[15px] leading-relaxed text-white/80 md:text-[16px]">
                {step.body}
              </p>
              <ul className="mt-6 space-y-2 text-[14px] text-white/65">
                {step.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="text-accent">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
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
