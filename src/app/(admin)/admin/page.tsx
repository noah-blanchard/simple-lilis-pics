"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/admin/Modal";
import { PhotoForm } from "@/components/admin/PhotoForm";
import { PhotoSkeletonGrid } from "@/components/admin/PhotoSkeletonGrid";
import { TagsManager } from "@/components/admin/TagsManager";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import { type PhotoWithTags, resolveImageUrl } from "@/types/db";

export default function AdminDashboard() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [editing, setEditing] = useState<PhotoWithTags | null>(null);
  // Tag side-panel state, shared by the create & edit modals.
  const [tagPanelOpen, setTagPanelOpen] = useState(false);

  const {
    data: photos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photos"],
    queryFn: () => apiFetch<PhotoWithTags[]>("/api/photos"),
  });

  const closeUpload = () => {
    setUploadOpen(false);
    setTagPanelOpen(false);
  };
  const closeEdit = () => {
    setEditing(null);
    setTagPanelOpen(false);
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[26px] tracking-tight">Photos</h1>
          <p className="mt-1 text-[14px] text-white/55">
            {photos ? `${photos.length} in the portfolio` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PillButton variant="ghost" onClick={() => setTagsOpen(true)}>
            Manage tags
          </PillButton>
          <PillButton variant="light" onClick={() => setUploadOpen(true)}>
            + New photo
          </PillButton>
        </div>
      </div>

      {/* Create */}
      <Modal
        open={uploadOpen}
        onClose={closeUpload}
        title="New photo"
        aside={<TagsManager />}
        asideOpen={tagPanelOpen}
        asideTitle="Tags"
      >
        <PhotoForm
          onSuccess={closeUpload}
          onManageTags={() => setTagPanelOpen((o) => !o)}
        />
      </Modal>

      {/* Edit — wider, photo on the left */}
      <Modal
        open={!!editing}
        onClose={closeEdit}
        title="Edit photo"
        baseWidthRem={66}
        aside={<TagsManager />}
        asideOpen={tagPanelOpen}
        asideTitle="Tags"
      >
        {editing && (
          <PhotoForm
            key={editing.id}
            photo={editing}
            onSuccess={closeEdit}
            onManageTags={() => setTagPanelOpen((o) => !o)}
          />
        )}
      </Modal>

      {/* Standalone tags manager */}
      <Modal
        open={tagsOpen}
        onClose={() => setTagsOpen(false)}
        title="Manage tags"
      >
        <TagsManager />
      </Modal>

      {isLoading && <PhotoSkeletonGrid />}

      {isError && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
          {(error as Error).message}
        </p>
      )}

      {photos && photos.length === 0 && (
        <p className="text-white/55">No photos yet.</p>
      )}

      {photos && photos.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <AdminPhotoCard
              key={photo.id}
              photo={photo}
              onEdit={() => setEditing(photo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPhotoCard({
  photo,
  onEdit,
}: {
  photo: PhotoWithTags;
  onEdit: () => void;
}) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["photos"] });

  const toggleFeatured = useMutation({
    mutationFn: () =>
      apiFetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !photo.featured }),
      }),
    onSuccess: invalidate,
  });

  const del = useMutation({
    mutationFn: () => apiFetch(`/api/photos/${photo.id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      setConfirmOpen(false);
    },
  });

  const year = photo.shoot_date.slice(0, 4);
  const tags = photo.tags.map((t) => t.label_en).join(", ");
  const busy = toggleFeatured.isPending || del.isPending;

  return (
    <article className="group overflow-hidden rounded-card bg-panel">
      <div className="relative aspect-4/5 overflow-hidden">
        <Image
          src={resolveImageUrl(photo.image_path)}
          alt={photo.title_en}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
        {photo.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 font-medium text-[11px] text-ink uppercase tracking-wide">
            Featured
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold text-[15px] tracking-tight">
          {photo.title_en}
        </h3>
        <p className="mt-1 truncate text-[12px] text-white/50">
          {year}
          {tags && ` — ${tags}`}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => toggleFeatured.mutate()}
            className={`rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors disabled:opacity-40 ${
              photo.featured
                ? "border-accent text-accent hover:bg-accent hover:text-ink"
                : "border-line text-white/60 hover:border-white/40"
            }`}
          >
            {photo.featured ? "★ Featured" : "☆ Feature"}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-white/70 transition-colors hover:border-white/40"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmOpen(true)}
            className="ml-auto rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-white/60 transition-colors hover:border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete photo"
        message={`“${photo.title_en}” and its image will be permanently removed.`}
        loading={del.isPending}
        onConfirm={() => del.mutate()}
        onClose={() => setConfirmOpen(false)}
      />
    </article>
  );
}
