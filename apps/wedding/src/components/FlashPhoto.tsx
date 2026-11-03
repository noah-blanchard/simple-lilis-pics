"use client";

import { motion, useReducedMotion } from "motion/react";
import { FLASH_FROM, FLASH_TO, flashTransition } from "@/lib/motion";
import { Photo, type PhotoProps } from "./Photo";

/** A night photograph that develops like a flash firing: it enters overexposed
 *  and settles, once, when scrolled into view (02-design-decisions §7). */
export const FlashPhoto = ({
  delay = 0,
  className = "",
  ...photo
}: PhotoProps & { delay?: number }) => {
  const reduce = useReducedMotion();
  if (reduce) return <Photo className={className} {...photo} />;
  return (
    <motion.div
      className={className}
      initial={{ filter: FLASH_FROM }}
      whileInView={{ filter: FLASH_TO }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...flashTransition, delay }}
    >
      <Photo {...photo} />
    </motion.div>
  );
};
