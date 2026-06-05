import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProjectGallery } from "@/components/ProjectGallery";
import type { Locale } from "@/i18n/routing";
import { getProject } from "@/lib/data/projects";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const project = await getProject(id, locale as Locale);
  if (!project) notFound();

  return <ProjectGallery project={project} />;
}
