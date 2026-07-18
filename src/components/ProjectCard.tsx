"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { hoverColorTransition, hoverRevealTransition } from "@/lib/motion";
import type { ResolvedProject } from "@/types/db";
import { IconArrow } from "./Icons";
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
        ease: [0.22, 1, 0.36, 1],
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
