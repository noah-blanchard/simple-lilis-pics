import { getLocale, getTranslations } from "next-intl/server";
import { AccentUnderline } from "@/components/AccentUnderline";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
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
    <section className="container-site section-y">
      <Reveal>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 2xl:mb-16">
          <div>
            <h2
              className="display text-4xl md:text-6xl min-[1440px]:text-h2b-fluid"
              style={{ textWrap: "balance" }}
            >
              <span>{t("titleBase")}</span>{" "}
              <AccentUnderline className="text-accent italic">
                {t("titleAccent")}
              </AccentUnderline>
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
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:gap-y-16">
        {items.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
};
