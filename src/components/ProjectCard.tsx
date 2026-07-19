"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  EASE,
  hoverColorTransition,
  hoverRevealTransition,
} from "@/lib/motion";
import type { ResolvedProject } from "@/types/db";
import { IconArrow } from "./Icons";
import { ProjectCaption } from "./ProjectCaption";
import { RoundedImage } from "./RoundedImage";

const MotionLink = motion.create(Link);

interface ProjectCardProps {
  project: ResolvedProject;
  index: number;
}

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const t = useTranslations("portfolio");
  const reduce = useReducedMotion();
  const title = project.title || t("untitled");

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: (index % 3) * 0.1,
        ease: EASE,
      }}
    >
      <Link href={`/portfolio/${project.id}`} className="block">
        <RoundedImage
          src={project.cover?.img ?? ""}
          alt={title}
          ratio="aspect-[4/5]"
          className="mb-5"
        >
          <motion.div
            className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-ink/30"
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            initial={false}
            transition={hoverRevealTransition}
          />
          <motion.div
            className="absolute top-5 right-5"
            variants={{
              rest: { opacity: 0, y: reduce ? 0 : -8 },
              hover: { opacity: 1, y: 0 },
            }}
            initial={false}
            transition={hoverRevealTransition}
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-inverse text-on-inverse">
              <IconArrow className="h-5 w-5" />
            </span>
          </motion.div>
        </RoundedImage>
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <ProjectCaption
            title={title}
            featured={project.featured}
            year={project.year}
            tags={project.tags}
            variant="card"
          />
        </div>
        <MotionLink
          href={`/portfolio/${project.id}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-fg/80"
          aria-label={title}
          whileHover={{
            backgroundColor: "var(--inverse)",
            color: "var(--on-inverse)",
          }}
          transition={hoverColorTransition}
        >
          <IconArrow className="h-4 w-4" />
        </MotionLink>
      </div>
    </motion.article>
  );
};
