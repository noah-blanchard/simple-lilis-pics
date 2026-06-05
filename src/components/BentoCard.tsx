"use client";

import { motion } from "motion/react";
import type { ResolvedProject } from "@/types/db";
import { IconArrow } from "./Icons";
import { RoundedImage } from "./RoundedImage";

interface BentoCardProps {
  project: ResolvedProject;
  index: number;
  /** Resolved Tailwind grid span classes from the bento pattern. */
  spanClassName: string;
  priority?: boolean;
}

// Image-filling bento tile with overlaid metadata revealed on hover.
// Differs from ProjectCard (metadata below image) — here the photo fills the
// grid cell and the title/tags sit on top of a gradient scrim.
export const BentoCard = ({
  project,
  index,
  spanClassName,
  priority = false,
}: BentoCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{
      duration: 0.8,
      delay: (index % 6) * 0.06,
      ease: [0.22, 1, 0.36, 1],
    }}
    className={`group h-full min-h-0 ${spanClassName}`}
  >
    <RoundedImage
      src={project.cover?.img ?? ""}
      alt={project.title}
      ratio="h-full"
      className="h-full"
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      priority={priority}
    >
      {/* Gradient scrim — softly visible at rest, deepens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top-right arrow drops in on hover */}
      <div className="-translate-y-2 absolute top-4 right-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-inverse text-on-inverse">
          <IconArrow className="h-5 w-5" />
        </span>
      </div>

      {/* Bottom metadata — settles up on hover */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="translate-y-1 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                project.featured ? "bg-accent" : "bg-fg/70"
              }`}
            />
            <h3
              className={`font-semibold text-[18px] tracking-tight md:text-[22px] ${
                project.featured ? "text-accent" : "text-fg"
              }`}
            >
              {project.title}
            </h3>
          </div>
          <div className="tag-mono pl-[18px] text-fg/70 uppercase">
            {project.year} — {project.tags}
          </div>
        </div>
      </div>
    </RoundedImage>
  </motion.article>
);
