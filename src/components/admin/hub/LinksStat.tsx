"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { AdminLinksSnapshot } from "@/types/db";
import { HubStat } from "./HubStat";

export function LinksStat() {
  const { data, isLoading } = useQuery({
    queryKey: ["links"],
    queryFn: () => apiFetch<AdminLinksSnapshot>("/api/links"),
  });

  if (isLoading || !data) return <HubStat loading value="" />;
  const published = data.links.filter((link) => link.published).length;
  const clicks = data.stats.reduce(
    (total, stat) => total + Number(stat.total),
    0,
  );
  return (
    <HubStat
      value={`${data.links.length} link${data.links.length === 1 ? "" : "s"}`}
      note={`${published} published · ${clicks} clicks`}
    />
  );
}
