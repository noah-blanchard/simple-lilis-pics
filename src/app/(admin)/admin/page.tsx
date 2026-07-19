"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/admin/Modal";
import { PhotoSkeletonGrid } from "@/components/admin/PhotoSkeletonGrid";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { TagsManager } from "@/components/admin/TagsManager";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import { MAX_FEATURED_PROJECTS } from "@/lib/api/schemas";
import { type ProjectWithRelations, resolveImageUrl } from "@/types/db";

export default function AdminDashboard() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectWithRelations | null>(null);
  const [tagPanelOpen, setTagPanelOpen] = useState(false);

  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<ProjectWithRelations[]>("/api/projects"),
  });

  const featuredCount = projects?.filter((p) => p.featured).length ?? 0;

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
          <h1 className="font-semibold text-[26px] tracking-tight">Projects</h1>
          <p className="mt-1 text-[14px] text-fg/55">
            {projects
              ? `${projects.length} project${projects.length === 1 ? "" : "s"} · ${featuredCount}/${MAX_FEATURED_PROJECTS} featured`
              : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PillButton
            variant="ghost"
            size="sm"
            onClick={() => setTagsOpen(true)}
          >
            Manage tags
          </PillButton>
          <PillButton
            variant="light"
            size="sm"
            onClick={() => setUploadOpen(true)}
          >
            + New project
          </PillButton>
        </div>
      </div>

      {/* Create */}
      <Modal
        open={uploadOpen}
        onClose={closeUpload}
        title="New project"
        baseWidthRem={66}
        aside={<TagsManager />}
        asideOpen={tagPanelOpen}
        asideTitle="Tags"
      >
        <ProjectForm
          featuredCount={featuredCount}
          onSuccess={closeUpload}
          onManageTags={() => setTagPanelOpen((o) => !o)}
        />
      </Modal>

      {/* Edit */}
      <Modal
        open={!!editing}
        onClose={closeEdit}
        title="Edit project"
        baseWidthRem={66}
        aside={<TagsManager />}
        asideOpen={tagPanelOpen}
        asideTitle="Tags"
      >
        {editing && (
          <ProjectForm
            key={editing.id}
            project={editing}
            featuredCount={featuredCount}
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
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[14px] text-danger">
          {(error as Error).message}
        </p>
      )}

      {projects && projects.length === 0 && (
        <p className="text-fg/55">No projects yet.</p>
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {projects.map((project) => (
            <AdminProjectCard
              key={project.id}
              project={project}
              featuredCount={featuredCount}
              onEdit={() => setEditing(project)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminProjectCard({
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
    <article className="group overflow-hidden rounded-card bg-panel">
      <div className="relative aspect-4/5 overflow-hidden">
        {cover && (
          <Image
            src={resolveImageUrl(cover.image_path)}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        )}
        {project.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 font-medium text-[11px] text-on-accent uppercase tracking-wide">
            Featured
          </span>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 font-medium text-[11px] text-fg backdrop-blur">
          {photoCount} 📷
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold text-[15px] tracking-tight">
          {title}
        </h3>
        <p className="mt-1 truncate text-[12px] text-fg/50">
          {year}
          {tags && ` — ${tags}`}
        </p>

        <div className="mt-3 flex items-center gap-2">
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
