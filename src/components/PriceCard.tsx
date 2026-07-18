"use client";

import { motion } from "motion/react";
import type { Plan } from "@/types";
import { IconCheck } from "./Icons";
import { PillButton } from "./PillButton";

interface PriceCardProps {
  plan: Plan;
  index: number;
  includesLabel: string;
  ctaLabel: string;
}

export const PriceCard = ({
  plan,
  index,
  includesLabel,
  ctaLabel,
}: PriceCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    className={`grid grid-cols-1 overflow-hidden rounded-card md:grid-cols-2 ${
      plan.highlighted ? "bg-accent text-on-accent" : "bg-panel text-fg"
    }`}
  >
    <div className="p-8 md:p-10">
      <h3 className="font-semibold text-2xl tracking-tight md:text-3xl">
        {plan.name}
      </h3>
      <p
        className={`mt-3 max-w-[260px] text-[14px] leading-snug ${
          plan.highlighted ? "text-on-accent/70" : "text-fg/55"
        }`}
      >
        {plan.blurb}
      </p>
      <div className="mt-10">
        <span className="display text-4xl md:text-5xl">{plan.unit}</span>
      </div>
      <PillButton
        href="#contact"
        variant={plan.highlighted ? "dark" : "accent"}
        className="mt-8 w-full"
      >
        {ctaLabel}
      </PillButton>
    </div>
    <div
      className={`p-8 md:p-10 ${
        plan.highlighted ? "bg-ink text-fg" : "bg-panel2"
      }`}
    >
      <div className="mb-5 font-medium text-[15px]">{includesLabel}</div>
      <ul className="space-y-3">
        {plan.includes.map((item) => (
          <li key={item} className="flex items-center gap-3 text-[15px]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent">
              <IconCheck className="h-3.5 w-3.5" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);
