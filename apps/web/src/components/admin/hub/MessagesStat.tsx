"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { ContactMessageRow } from "@/types/db";
import { HubStat } from "./HubStat";

export function MessagesStat() {
  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => apiFetch<ContactMessageRow[]>("/api/contact"),
  });

  if (isLoading || !data) return <HubStat loading value="" />;

  const unread = data.filter((message) => !message.read_at).length;

  return (
    <HubStat
      value={
        unread > 0
          ? `${unread} unread`
          : `${data.length} enquir${data.length === 1 ? "y" : "ies"}`
      }
      note={unread > 0 ? `${data.length} in total` : "Nothing new"}
      attention={unread > 0}
    />
  );
}
