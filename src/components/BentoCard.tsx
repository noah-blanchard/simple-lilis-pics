"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { EASE } from "@/lib/motion";
import type { ResolvedProject } from "@/types/db";
import { RoundedImage } from "./RoundedImage";

interface BentoCardProps {
  project: ResolvedProject;
  index: number;
  priority?: boolean;
  /** Fill the parent (a bento cell that already owns the aspect ratio) instead
   *  of imposing the card's own orientation-based aspect + max-width. */
  fill?: boolean;
}

// Clean, image-only card: no caption, tags, or overlay chrome — the grids show
// pictures only; project details live behind the click (project page/lightbox).
export const BentoCard = ({
  project,
  index,
  priority = false,
  fill = false,
}: BentoCardProps) => {
  const ratio =
    project.cover?.orientation === "portrait"
      ? "aspect-[9/16]"
      : "aspect-[16/9]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.8,
        delay: (index % 6) * 0.06,
        ease: EASE,
      }}
      className={fill ? "h-full w-full" : "mx-auto w-full max-w-[640px]"}
    >
      <Link
        href={`/portfolio/${project.id}`}
        className={fill ? "block h-full" : "block"}
        aria-label={project.title || undefined}
      >
        <RoundedImage
          src={project.cover?.img ?? ""}
          alt={project.title}
          ratio={fill ? "" : ratio}
          className={fill ? "h-full" : ""}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
      </Link>
    </motion.article>
  );
};
