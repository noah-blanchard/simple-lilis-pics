import { getLocale, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { TagLabel } from "@/components/TagLabel";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getFeaturedProjects } from "@/lib/data/projects";

export const Featured = async () => {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("portfolio");

  // Home page shows only the curated featured photos (newest first, capped at
  // 8); the full archive lives on the dedicated /portfolio bento page.
  const items = await getFeaturedProjects(locale);

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
              <span>{t("titleBase")}</span>
              <span className="text-accent">{t("titleAccent")}</span>
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-fg/80 hover:text-fg"
          >
            <span>{t("viewAll")}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
};
