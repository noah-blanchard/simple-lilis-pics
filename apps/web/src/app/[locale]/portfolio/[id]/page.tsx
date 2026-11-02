import { getProject } from "@lili/core/data/projects";
import type { Locale } from "@lili/core/i18n/routing";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProjectGallery } from "@/components/ProjectGallery";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const project = await getProject(id, locale as Locale);
  if (!project) return {};
  // No title → fall back to the layout's default page title.
  const title = project.title || undefined;
  const description = project.description || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: project.cover ? [project.cover.img] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const project = await getProject(id, locale as Locale);
  // A gallery with no photos would crash the viewer (it indexes photos[0]);
  // treat a photo-less project as not found.
  if (!project || project.photos.length === 0) notFound();

  return <ProjectGallery project={project} />;
}
