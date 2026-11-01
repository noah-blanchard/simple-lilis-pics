"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { MIN_PUBLIC_TESTIMONIALS } from "@/lib/rating";
import type { RatingRow } from "@/types/db";
import { HubStat } from "./HubStat";

export function RatingsStat() {
  const { data, isLoading } = useQuery({
    queryKey: ["ratings"],
    queryFn: () => apiFetch<RatingRow[]>("/api/ratings"),
  });

  if (isLoading || !data) return <HubStat loading value="" />;

  // Only an approved rating that carries a note can reach the public
  // testimonials, so that is the number worth surfacing here.
  const publishable = data.filter((rating) => rating.note?.trim());
  const approved = publishable.filter((rating) => rating.approved).length;
  const waiting = publishable.length - approved;

  return (
    <HubStat
      value={`${data.length} rating${data.length === 1 ? "" : "s"}`}
      note={
        approved < MIN_PUBLIC_TESTIMONIALS
          ? `${approved}/${MIN_PUBLIC_TESTIMONIALS} needed to show testimonials`
          : waiting > 0
            ? `${waiting} awaiting review`
            : "All reviewed"
      }
      attention={approved < MIN_PUBLIC_TESTIMONIALS || waiting > 0}
    />
  );
}
