"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { disclosureTransition } from "@/lib/motion";

/** One question: a button that opens its answer with an animated height. */
export const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const id = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const transition = reduce ? { duration: 0 } : disclosureTransition;

  return (
    <li className="border-line border-b">
      <h4>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full cursor-pointer items-baseline justify-between gap-6 py-5 text-left"
        >
          <span className="display text-[clamp(22px,2.2vw,30px)] leading-[1.2]">
            {q}
          </span>
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 45 : 0 }}
            transition={transition}
            className="font-display text-[30px] text-muted leading-none"
          >
            +
          </motion.span>
        </button>
      </h4>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-a`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <p className="max-w-[36em] pb-6 text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};
