"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EASE, hoverRevealTransition } from "@/lib/motion";
import type { ResolvedProject } from "@/types/db";
import { IconArrow } from "./Icons";
import { ProjectCaption } from "./ProjectCaption";
import { RoundedImage } from "./RoundedImage";

interface BentoCardProps {
  project: ResolvedProject;
  index: number;
  priority?: boolean;
}

export const BentoCard = ({
  project,
  index,
  priority = false,
}: BentoCardProps) => {
  const t = useTranslations("portfolio");
  const reduce = useReducedMotion();
  const ratio =
    project.cover?.orientation === "portrait"
      ? "aspect-[9/16]"
      : "aspect-[16/9]";
  const title = project.title || t("untitled");

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
      className="mx-auto w-full max-w-[480px]"
    >
      <Link href={`/portfolio/${project.id}`} className="block">
        <RoundedImage
          src={project.cover?.img ?? ""}
          alt={title}
          ratio={ratio}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        >
          {/* Arrow drops in top-right on hover */}
          <motion.div
            className="absolute top-4 right-4"
            variants={{
              rest: { opacity: 0, y: reduce ? 0 : -8 },
              hover: { opacity: 1, y: 0 },
            }}
            initial={false}
            transition={hoverRevealTransition}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-inverse text-on-inverse">
              <IconArrow className="h-5 w-5" />
            </span>
          </motion.div>

          {/* Bottom metadata */}
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <motion.div
              variants={{
                rest: { opacity: 0.9, y: reduce ? 0 : 4 },
                hover: { opacity: 1, y: 0 },
              }}
              initial={false}
              transition={hoverRevealTransition}
            >
              <ProjectCaption
                title={title}
                featured={project.featured}
                year={project.year}
                tags={project.tags}
                variant="bento"
              />
            </motion.div>
          </div>
        </RoundedImage>
      </Link>
    </motion.article>
  );
};
