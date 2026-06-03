"use client";

import { motion } from "motion/react";
import type { Specialty } from "@/types";
import { CatIcon } from "./Icons";

interface SpecialtyCardProps {
  specialty: Specialty;
  index: number;
  isActive: boolean;
  onSelect: (id: Specialty["id"]) => void;
}

export const SpecialtyCard = ({
  specialty,
  index,
  isActive,
  onSelect,
}: SpecialtyCardProps) => (
  <motion.button
    type="button"
    onClick={() => onSelect(specialty.id)}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{
      duration: 0.6,
      delay: (index % 4) * 0.06,
      ease: [0.22, 1, 0.36, 1],
    }}
    animate={isActive ? { scale: 1.04, rotate: -1.5 } : { scale: 1, rotate: 0 }}
    whileHover={{ y: -4 }}
    className={`flex aspect-square flex-col justify-between rounded-card p-7 text-left transition-colors duration-300 ${
      isActive ? "bg-accent text-ink" : "bg-panel text-white hover:bg-panel2"
    }`}
  >
    <div className="flex justify-end">
      <CatIcon kind={specialty.id} className="h-9 w-9" />
    </div>
    <div>
      <div className="mb-2 text-2xl font-semibold tracking-tight md:text-[28px]">
        {specialty.title}
      </div>
      <p
        className={`text-[13px] leading-snug ${
          isActive ? "text-ink/70" : "text-white/55"
        }`}
      >
        {specialty.desc}
      </p>
    </div>
  </motion.button>
);
