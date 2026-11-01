"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { ProjectWithRelations } from "@/types/db";
import { HubStat } from "./HubStat";

/** Reuses the ["projects"] key the projects page already registers, so landing
 *  on the hub warms the cache instead of duplicating the request. */
export function ProjectsStat() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<ProjectWithRelations[]>("/api/projects"),
  });

  if (isLoading || !data) return <HubStat loading value="" />;

  const photos = data.reduce(
    (total, project) => total + project.project_photos.length,
    0,
  );

  return (
    <HubStat
      value={`${data.length} project${data.length === 1 ? "" : "s"}`}
      note={`${photos} photo${photos === 1 ? "" : "s"}`}
    />
  );
}
