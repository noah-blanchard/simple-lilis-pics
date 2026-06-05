"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { ResolvedProject } from "@/types/db";
import { IconArrow } from "./Icons";
import { RoundedImage } from "./RoundedImage";

interface ProjectCardProps {
  project: ResolvedProject;
  index: number;
}

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const title = project.title || "Untitled";

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: (index % 3) * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      <Link href={`/portfolio/${project.id}`} className="block">
        <RoundedImage
          src={project.cover?.img ?? ""}
          alt={title}
          ratio="aspect-[4/5]"
          className="mb-5"
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-ink/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="-translate-y-2 absolute top-5 right-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-inverse text-on-inverse">
              <IconArrow className="h-5 w-5" />
            </span>
          </div>
        </RoundedImage>
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                project.featured ? "bg-accent" : "bg-fg/70"
              }`}
            />
            <h3
              className={`font-semibold text-[20px] tracking-tight md:text-[22px] ${
                project.featured ? "text-accent" : "text-fg"
              }`}
            >
              {title}
            </h3>
          </div>
          <div className="pl-4.5 text-[13px] text-fg/55">
            {project.year}
            {project.tags && ` — ${project.tags}`}
          </div>
        </div>
        <Link
          href={`/portfolio/${project.id}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-fg/80 transition-colors hover:bg-inverse hover:text-on-inverse"
          aria-label={title}
        >
          <IconArrow className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
};
