"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { ActionSheet } from "@/components/admin/ActionSheet";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { IconDots } from "@/components/Icons";
import { apiFetch } from "@/lib/api/client";
import { MAX_FEATURED_PROJECTS } from "@/lib/api/schemas";
import { type ProjectWithRelations, resolveImageUrl } from "@/types/db";

/** One project in the admin list. A compact row on phones and a cover-led card
 *  from `sm` up — one DOM tree either way, so the cover image is never fetched
 *  twice for a hidden layout. */
export function AdminProjectCard({
  project,
  featuredCount,
  onEdit,
}: {
  project: ProjectWithRelations;
  featuredCount: number;
  onEdit: () => void;
}) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["projects"] });

  const toggleFeatured = useMutation({
    mutationFn: () =>
      apiFetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !project.featured }),
      }),
    onSuccess: invalidate,
  });

  const del = useMutation({
    mutationFn: () =>
      apiFetch(`/api/projects/${project.id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      setConfirmOpen(false);
    },
  });

  const cover =
    project.project_photos.find((p) => p.id === project.cover_photo_id) ??
    project.project_photos[0];
  const title = project.title_en || project.title_fr || "Untitled";
  const year = project.project_date?.slice(0, 4) ?? "";
  const tags = project.project_tags.map((pt) => pt.tags.label_en).join(", ");
  const photoCount = project.project_photos.length;
  const busy = toggleFeatured.isPending || del.isPending;
  const capReached =
    !project.featured && featuredCount >= MAX_FEATURED_PROJECTS;

  return (
    <article className="flex items-center gap-3 overflow-hidden rounded-card bg-panel p-2 sm:block sm:p-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:aspect-4/5 sm:h-auto sm:w-auto sm:rounded-none">
        {cover && (
          <Image
            src={resolveImageUrl(cover.image_path)}
            alt={title}
            fill
            sizes="(max-width: 640px) 80px, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        )}
        {project.featured && (
          <span className="absolute top-1 left-1 rounded-full bg-accent px-1.5 py-0.5 font-medium text-[9px] text-on-accent uppercase tracking-wide sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
            <span className="sm:hidden">★</span>
            <span className="hidden sm:inline">Featured</span>
          </span>
        )}
        <span className="absolute top-1 right-1 hidden rounded-full bg-ink/70 px-2.5 py-1 font-medium text-[11px] text-fg backdrop-blur sm:top-3 sm:right-3 sm:inline">
          {photoCount} 📷
        </span>
      </div>

      <div className="min-w-0 flex-1 sm:p-4">
        <h3 className="truncate font-semibold text-[15px] tracking-tight">
          {title}
        </h3>
        <p className="mt-1 truncate text-[12px] text-fg/50">
          {year}
          {tags && ` — ${tags}`}
          <span className="sm:hidden">
            {" "}
            · {photoCount} photo{photoCount === 1 ? "" : "s"}
          </span>
        </p>

        {/* Desktop: inline actions. */}
        <div className="mt-3 hidden items-center gap-2 sm:flex">
          <button
            type="button"
            disabled={busy || capReached}
            onClick={() => toggleFeatured.mutate()}
            title={capReached ? "Featured limit reached" : undefined}
            className={`rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors disabled:opacity-40 ${
              project.featured
                ? "border-accent text-accent hover:bg-accent hover:text-on-accent"
                : "border-line text-fg/60 hover:border-fg/40"
            }`}
          >
            {project.featured ? "★ Featured" : "☆ Feature"}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-fg/70 transition-colors hover:border-fg/40"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmOpen(true)}
            className="ml-auto rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-fg/60 transition-colors hover:border-danger hover:bg-danger hover:text-on-danger disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Mobile: one 44px target opening a full-width action list. */}
      <button
        type="button"
        onClick={() => setActionsOpen(true)}
        aria-label={`Actions for ${title}`}
        disabled={busy}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-fg/50 disabled:opacity-40 sm:hidden"
      >
        <IconDots className="h-5 w-5" />
      </button>

      <ActionSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        title={title}
        actions={[
          {
            label: project.featured ? "Remove from featured" : "Feature",
            onSelect: () => toggleFeatured.mutate(),
            disabled: capReached,
            hint: capReached
              ? `Featured limit of ${MAX_FEATURED_PROJECTS} reached`
              : undefined,
          },
          { label: "Edit", onSelect: onEdit },
          {
            label: "Delete",
            onSelect: () => setConfirmOpen(true),
            destructive: true,
          },
        ]}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete project"
        message={`“${title}” and its ${photoCount} photo${photoCount === 1 ? "" : "s"} will be permanently removed.`}
        loading={del.isPending}
        onConfirm={() => del.mutate()}
        onClose={() => setConfirmOpen(false)}
      />
    </article>
  );
}
