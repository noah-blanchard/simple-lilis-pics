"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { PhotoSkeletonGrid } from "@/components/admin/PhotoSkeletonGrid";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminProjectCard } from "@/components/admin/projects/AdminProjectCard";
import { TagsManager } from "@/components/admin/TagsManager";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import { MAX_FEATURED_PROJECTS } from "@/lib/api/schemas";
import type { ProjectWithRelations } from "@/types/db";

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
          {/* On mobile the section title already lives in the top bar. */}
          <h1 className="hidden font-semibold text-[26px] tracking-tight lg:block">
            Projects
          </h1>
          <p className="text-[14px] text-fg/55 lg:mt-1">
            {projects
              ? `${projects.length} project${projects.length === 1 ? "" : "s"} · ${featuredCount}/${MAX_FEATURED_PROJECTS} featured`
              : "Loading…"}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          {/* The sidebar and tab bar already lead to Featured, so this
              shortcut is desktop-only where there is room for it. */}
          <PillButton
            variant="ghost"
            size="sm"
            href="/admin/featured"
            className="hidden lg:inline-flex"
          >
            Featured layout →
          </PillButton>
          <PillButton
            variant="ghost"
            size="sm"
            onClick={() => setTagsOpen(true)}
            className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
          >
            Manage tags
          </PillButton>
          <PillButton
            variant="light"
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
          >
            + New project
          </PillButton>
        </div>
      </div>

      {/* Create */}
      <AdminDialog
        open={uploadOpen}
        onClose={closeUpload}
        title="New project"
        baseWidthRem={66}
        aside={<TagsManager />}
        asideOpen={tagPanelOpen}
        asideTitle="Tags"
        onAsideClose={() => setTagPanelOpen(false)}
      >
        <ProjectForm
          featuredCount={featuredCount}
          onSuccess={closeUpload}
          onManageTags={() => setTagPanelOpen((o) => !o)}
        />
      </AdminDialog>

      {/* Edit */}
      <AdminDialog
        open={!!editing}
        onClose={closeEdit}
        title="Edit project"
        baseWidthRem={66}
        aside={<TagsManager />}
        asideOpen={tagPanelOpen}
        asideTitle="Tags"
        onAsideClose={() => setTagPanelOpen(false)}
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
      </AdminDialog>

      {/* Standalone tags manager */}
      <AdminDialog
        open={tagsOpen}
        onClose={() => setTagsOpen(false)}
        title="Manage tags"
      >
        <TagsManager />
      </AdminDialog>

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
        /* A stacked list on phones, the cover grid from sm up. */
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
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
