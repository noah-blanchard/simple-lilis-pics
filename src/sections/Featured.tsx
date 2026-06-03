import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { TagLabel } from "@/components/TagLabel";
import { projects } from "@/data/projects";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/types";

export const Featured = () => {
  const t = useTranslations("portfolio");

  // Home page shows only the curated featured projects; the full archive lives
  // on the dedicated /portfolio bento page.
  const items: Project[] = projects
    .filter((p) => p.featured)
    .map((p) => ({
      ...p,
      title: t(`projects.${p.id}.title`),
      tags: t(`projects.${p.id}.tags`),
    }));

  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <Reveal>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <TagLabel>{t("tag")}</TagLabel>
            <h2
              className="display mt-3 text-4xl md:text-6xl"
              style={{ textWrap: "balance" }}
            >
              {t("title")}
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white"
          >
            <span>{t("viewAll")}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
};
