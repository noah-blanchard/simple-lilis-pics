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
  const publishedSocials = data.socials.filter(
    (social) => social.published,
  ).length;
  const clicks = [...data.stats, ...data.socialStats].reduce(
    (total, stat) => total + Number(stat.total),
    0,
  );
  return (
    <HubStat
      value={`${data.links.length} link${data.links.length === 1 ? "" : "s"} · ${data.socials.length} social${data.socials.length === 1 ? "" : "s"}`}
      note={`${published + publishedSocials} published · ${clicks} clicks`}
    />
  );
}
