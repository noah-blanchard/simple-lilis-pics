"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ResolvedProject } from "@/types/db";
import { IconArrow } from "./Icons";
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
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group w-full"
    >
      <Link href={`/portfolio/${project.id}`} className="block">
        <RoundedImage
          src={project.cover?.img ?? ""}
          alt={title}
          ratio={ratio}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        >
          {/* Gradient scrim — visible at rest, deepens on hover */}
          <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Arrow drops in top-right on hover */}
          <div className="-translate-y-2 absolute top-4 right-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-inverse text-on-inverse">
              <IconArrow className="h-5 w-5" />
            </span>
          </div>

          {/* Bottom metadata */}
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
                  {title}
                </h3>
              </div>
              <div className="tag-mono pl-4.5 text-fg/70 uppercase">
                {project.year}
                {project.tags && ` — ${project.tags}`}
              </div>
            </div>
          </div>
        </RoundedImage>
      </Link>
    </motion.article>
  );
};
