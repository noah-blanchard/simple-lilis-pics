"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { MAX_FEATURED_PROJECTS } from "@/lib/api/schemas";
import type { ProjectWithRelations } from "@/types/db";
import { HubStat } from "./HubStat";

export function FeaturedStat() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<ProjectWithRelations[]>("/api/projects"),
  });

  if (isLoading || !data) return <HubStat loading value="" />;

  const featured = data.filter((project) => project.featured).length;

  return (
    <HubStat
      value={`${featured} / ${MAX_FEATURED_PROJECTS} slots`}
      note={featured === 0 ? "Nothing on the home page yet" : "On the home page"}
      attention={featured === 0}
    />
  );
}
