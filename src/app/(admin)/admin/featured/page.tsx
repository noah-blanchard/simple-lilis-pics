"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Reorder, useDragControls } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { FeaturedProjectListItem } from "@/components/admin/FeaturedProjectListItem";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import { type ProjectWithRelations, resolveImageUrl } from "@/types/db";

interface FeaturedRow {
  id: string;
  title: string;
  year: string;
  src: string;
}

function toRow(project: ProjectWithRelations): FeaturedRow {
  const cover =
    project.project_photos.find((p) => p.id === project.cover_photo_id) ??
    project.project_photos[0];
  return {
    id: project.id,
    title: project.title_en || project.title_fr || "Untitled",
    year: project.project_date?.slice(0, 4) ?? "",
    src: cover ? resolveImageUrl(cover.image_path) : "",
  };
}

export default function FeaturedReorderPage() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<ProjectWithRelations[]>("/api/projects"),
  });

  const [order, setOrder] = useState<FeaturedRow[]>([]);

  // Seed the local (draggable) order once, the first time data arrives —
  // not on every background refetch, so an in-progress drag never gets
  // silently reset out from under the user.
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || !projects) return;
    initialized.current = true;
    const featured = projects
      .filter((p) => p.featured)
      .sort(
        (a, b) =>
          (a.featured_order ?? Infinity) - (b.featured_order ?? Infinity),
      );
    setOrder(featured.map(toRow));
  }, [projects]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch("/api/projects/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: order.map((r) => r.id) }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[26px] tracking-tight">
            Reorder featured
          </h1>
          <p className="mt-1 text-[14px] text-fg/55">
            Drag to set the order shown in the home page&apos;s featured grid.
          </p>
        </div>
        <PillButton
          variant="light"
          size="sm"
          disabled={save.isPending || order.length === 0}
          onClick={() => save.mutate()}
        >
          {save.isPending ? "Saving…" : "Save order"}
        </PillButton>
      </div>

      {save.isError && (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[14px] text-danger">
          {(save.error as Error).message}
        </p>
      )}
      {save.isSuccess && !save.isPending && (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-[14px] text-accent">
          Order saved.
        </p>
      )}

      {isLoading && <p className="text-fg/55">Loading…</p>}
      {!isLoading && order.length === 0 && (
        <p className="text-fg/55">No featured projects yet.</p>
      )}

      <Reorder.Group
        as="div"
        axis="y"
        values={order}
        onReorder={setOrder}
        className="max-w-xl space-y-3"
      >
        {order.map((row) => (
          <DraggableRow key={row.id} value={row}>
            {(onDragHandlePointerDown) => (
              <FeaturedProjectListItem
                src={row.src}
                title={row.title}
                year={row.year}
                onDragHandlePointerDown={onDragHandlePointerDown}
              />
            )}
          </DraggableRow>
        ))}
      </Reorder.Group>
    </div>
  );
}

/** Wraps one Reorder.Item + its own useDragControls instance, so drag can be
 *  started only from a handle (mirrors ProjectForm's DraggablePhotoItem). */
function DraggableRow<T>({
  value,
  children,
}: {
  value: T;
  children: (
    onDragHandlePointerDown: (e: React.PointerEvent) => void,
  ) => ReactNode;
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      value={value}
      as="div"
      dragListener={false}
      dragControls={dragControls}
    >
      {children((e) => dragControls.start(e))}
    </Reorder.Item>
  );
}
