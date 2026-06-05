"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FEATURED_PROJECTS,
  MAX_PROJECT_PHOTOS,
} from "@/lib/api/schemas";
import {
  type Orientation,
  type ProjectWithRelations,
  resolveImageUrl,
  type TagRow,
} from "@/types/db";

// All metadata is optional; empty strings become null on submit.
const schema = z.object({
  title_en: z.string(),
  title_fr: z.string(),
  description_en: z.string(),
  description_fr: z.string(),
  project_date: z.string(),
});
type FormValues = z.infer<typeof schema>;

const COMPRESSION_OPTIONS = {
  maxSizeMB: 4.5,
  maxWidthOrHeight: 2560,
  useWebWorker: true,
};

const fieldClass =
  "w-full rounded-2xl border border-line bg-panel2 px-4 py-3 text-[15px] text-fg placeholder:text-fg/40 outline-none transition-colors focus:border-accent";
const labelClass = "tag-mono mb-2 block uppercase text-fg/70";

/** A newly-selected (create-mode) photo with its local preview + orientation. */
interface LocalPhoto {
  file: File;
  previewUrl: string;
  orientation: Orientation;
}

/** An existing (edit-mode) photo. */
interface EditPhoto {
  id: string;
  img: string;
  orientation: Orientation;
  position: number;
}

/** Detect orientation from a file's natural dimensions. */
function detectOrientation(file: File): Promise<Orientation> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve(img.naturalWidth >= img.naturalHeight ? "landscape" : "portrait");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("landscape");
    };
    img.src = url;
  });
}

interface ProjectFormProps {
  /** When provided, edits this project. Image add/remove is not supported in edit. */
  project?: ProjectWithRelations;
  /** Total featured projects in the dashboard (for the max-6 cap UI). */
  featuredCount: number;
  onSuccess?: () => void;
  onManageTags?: () => void;
}

export function ProjectForm({
  project,
  featuredCount,
  onSuccess,
  onManageTags,
}: ProjectFormProps) {
  const isEdit = Boolean(project);
  const queryClient = useQueryClient();

  const [newPhotos, setNewPhotos] = useState<LocalPhoto[]>([]);
  const [editPhotos, setEditPhotos] = useState<EditPhoto[]>(() =>
    project
      ? [...project.project_photos]
          .sort((a, b) => a.position - b.position)
          .map((p) => ({
            id: p.id,
            img: resolveImageUrl(p.image_path),
            orientation: p.orientation,
            position: p.position,
          }))
      : [],
  );

  const [coverIndex, setCoverIndex] = useState(0); // create mode
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(
    project?.cover_photo_id ?? null,
  ); // edit mode

  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    () => project?.project_tags.map((pt) => pt.tags.id) ?? [],
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Featured cap: an already-featured project doesn't count against itself.
  const othersFeatured = project?.featured ? featuredCount - 1 : featuredCount;
  const featuredLocked = !featured && othersFeatured >= MAX_FEATURED_PROJECTS;

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => apiFetch<TagRow[]>("/api/tags"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title_en: project?.title_en ?? "",
      title_fr: project?.title_fr ?? "",
      description_en: project?.description_en ?? "",
      description_fr: project?.description_fr ?? "",
      project_date: project?.project_date ?? "",
    },
  });

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => {
      for (const p of newPhotos) URL.revokeObjectURL(p.previewUrl);
    };
  }, [newPhotos]);

  const onFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file
    if (picked.length === 0) return;

    const remaining = MAX_PROJECT_PHOTOS - newPhotos.length;
    const accepted: LocalPhoto[] = [];
    for (const file of picked.slice(0, remaining)) {
      if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        setFileError("Unsupported image type (JPEG, PNG, WebP or AVIF)");
        continue;
      }
      const orientation = await detectOrientation(file);
      accepted.push({
        file,
        previewUrl: URL.createObjectURL(file),
        orientation,
      });
    }
    if (picked.length > remaining) {
      setFileError(`Maximum ${MAX_PROJECT_PHOTOS} photos per project`);
    }
    setNewPhotos((prev) => [...prev, ...accepted]);
  };

  const removeNewPhoto = (i: number) => {
    setNewPhotos((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl);
      const next = prev.filter((_, idx) => idx !== i);
      return next;
    });
    setCoverIndex((ci) => (ci === i ? 0 : ci > i ? ci - 1 : ci));
  };

  const setNewOrientation = (i: number, orientation: Orientation) =>
    setNewPhotos((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, orientation } : p)),
    );

  const setEditOrientation = (id: string, orientation: Orientation) =>
    setEditPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, orientation } : p)),
    );

  const toggleTag = (id: string) =>
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEdit && project) {
        return apiFetch<{ id: string }>(`/api/projects/${project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title_en: values.title_en || null,
            title_fr: values.title_fr || null,
            description_en: values.description_en || null,
            description_fr: values.description_fr || null,
            project_date: values.project_date || null,
            featured,
            tag_ids: selectedTags,
            cover_photo_id: coverPhotoId ?? undefined,
            photos: editPhotos.map((p) => ({
              id: p.id,
              position: p.position,
              orientation: p.orientation,
            })),
          }),
        });
      }

      if (newPhotos.length === 0) throw new Error("Add at least one photo");

      const fd = new FormData();
      if (values.title_en) fd.append("title_en", values.title_en);
      if (values.title_fr) fd.append("title_fr", values.title_fr);
      if (values.description_en)
        fd.append("description_en", values.description_en);
      if (values.description_fr)
        fd.append("description_fr", values.description_fr);
      if (values.project_date) fd.append("project_date", values.project_date);
      fd.append("featured", String(featured));
      fd.append("cover_index", String(coverIndex));
      for (const id of selectedTags) fd.append("tag_ids", id);

      setStatus("Compressing…");
      for (const [i, p] of newPhotos.entries()) {
        const compressed = await imageCompression(p.file, COMPRESSION_OPTIONS);
        fd.append("files", compressed, p.file.name);
        fd.append("orientation", p.orientation);
        fd.append("position", String(i));
      }

      setStatus("Uploading…");
      return apiFetch<{ id: string }>("/api/projects", {
        method: "POST",
        body: fd,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setStatus(null);
      onSuccess?.();
    },
    onError: () => setStatus(null),
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));
  const busy = mutation.isPending;
  const submitLabel = isEdit ? "Save changes" : (status ?? "Create project");

  // ── Orientation toggle (shared) ──
  const orientationToggle = (
    current: Orientation,
    onSet: (o: Orientation) => void,
  ) => (
    <div className="flex overflow-hidden rounded-lg border border-line text-[11px]">
      {(["landscape", "portrait"] as Orientation[]).map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onSet(o)}
          className={`px-2 py-1 capitalize transition-colors ${
            current === o
              ? "bg-inverse text-on-inverse"
              : "text-fg/60 hover:text-fg"
          }`}
        >
          {o === "landscape" ? "▭" : "▯"} {o}
        </button>
      ))}
    </div>
  );

  const coverBadge = (active: boolean, onSelect: () => void) => (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border px-2 py-1 text-[11px] transition-colors ${
        active
          ? "border-accent bg-accent text-on-accent"
          : "border-line text-fg/60 hover:border-fg/40"
      }`}
    >
      {active ? "★ Cover" : "☆ Cover"}
    </button>
  );

  // ── Photos panel (left) ──
  const photosPanel = (
    <div className="flex h-full flex-col gap-3">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {isEdit
          ? editPhotos.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 rounded-2xl border border-line bg-panel2 p-2.5"
              >
                <div
                  className={`relative shrink-0 overflow-hidden rounded-lg bg-ink ${
                    p.orientation === "portrait" ? "h-24 w-[54px]" : "h-24 w-40"
                  }`}
                >
                  {/* biome-ignore lint/performance/noImgElement: stored remote thumb */}
                  <img
                    src={p.img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-2">
                  {orientationToggle(p.orientation, (o) =>
                    setEditOrientation(p.id, o),
                  )}
                  {coverBadge(coverPhotoId === p.id, () => setCoverPhotoId(p.id))}
                </div>
              </div>
            ))
          : newPhotos.map((p, i) => (
              <div
                key={p.previewUrl}
                className="flex gap-3 rounded-2xl border border-line bg-panel2 p-2.5"
              >
                <div
                  className={`relative shrink-0 overflow-hidden rounded-lg bg-ink ${
                    p.orientation === "portrait" ? "h-24 w-[54px]" : "h-24 w-40"
                  }`}
                >
                  {/* biome-ignore lint/performance/noImgElement: local blob preview */}
                  <img
                    src={p.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  {orientationToggle(p.orientation, (o) =>
                    setNewOrientation(i, o),
                  )}
                  <div className="flex items-center gap-2">
                    {coverBadge(coverIndex === i, () => setCoverIndex(i))}
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(i)}
                      className="ml-auto rounded-lg border border-line px-2 py-1 text-[11px] text-fg/60 transition-colors hover:border-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

        {/* Add-more dropzone (create only, < 4) */}
        {!isEdit && newPhotos.length < MAX_PROJECT_PHOTOS && (
          <label
            htmlFor="project-files"
            className="flex min-h-[88px] cursor-pointer items-center justify-center rounded-2xl border border-line border-dashed bg-panel2 px-4 text-center transition-colors hover:border-accent"
          >
            <div>
              <p className="text-[14px] text-fg/70">
                Click to add {newPhotos.length === 0 ? "photos" : "more"} (
                {newPhotos.length}/{MAX_PROJECT_PHOTOS})
              </p>
              <p className="mt-1 text-[12px] text-fg/40">
                1–4 photos · orientation auto-detected
              </p>
            </div>
            <input
              id="project-files"
              type="file"
              multiple
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={onFilesChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      {fileError && <p className="text-[13px] text-red-400">{fileError}</p>}
    </div>
  );

  // ── Fields (right) ──
  const fieldsBody = (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="title_en" className={labelClass}>
            Title (EN)
          </label>
          <input
            id="title_en"
            type="text"
            placeholder="Optional"
            className={fieldClass}
            {...register("title_en")}
          />
        </div>
        <div>
          <label htmlFor="title_fr" className={labelClass}>
            Title (FR)
          </label>
          <input
            id="title_fr"
            type="text"
            placeholder="Optionnel"
            className={fieldClass}
            {...register("title_fr")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="description_en" className={labelClass}>
            Description (EN)
          </label>
          <textarea
            id="description_en"
            rows={3}
            placeholder="Optional"
            className={`${fieldClass} resize-none`}
            {...register("description_en")}
          />
        </div>
        <div>
          <label htmlFor="description_fr" className={labelClass}>
            Description (FR)
          </label>
          <textarea
            id="description_fr"
            rows={3}
            placeholder="Optionnel"
            className={`${fieldClass} resize-none`}
            {...register("description_fr")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="project_date" className={labelClass}>
            Date
          </label>
          <input
            id="project_date"
            type="date"
            className={fieldClass}
            {...register("project_date")}
          />
        </div>
        <div>
          <span className={labelClass}>Visibility</span>
          <label
            htmlFor="featured"
            className={`flex h-[50px] items-center gap-3 rounded-2xl border border-line bg-panel2 px-4 ${
              featuredLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              disabled={featuredLocked}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-[14px] text-fg/70">
              Featured ({featuredCount}/{MAX_FEATURED_PROJECTS})
            </span>
          </label>
          {featuredLocked && (
            <p className="mt-1.5 text-[12px] text-fg/40">
              Limit reached — unfeature another project first.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="tag-mono text-fg/70 uppercase">Tags</span>
          {onManageTags && (
            <button
              type="button"
              onClick={onManageTags}
              className="text-[12px] text-accent transition-opacity hover:opacity-70"
            >
              + Manage tags
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => {
            const active = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line text-fg/70 hover:border-fg/40"
                }`}
              >
                {tag.label_en}
              </button>
            );
          })}
          {!tags && <span className="text-[13px] text-fg/40">Loading…</span>}
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="shrink-0 pt-5">
      {mutation.isError && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
          {(mutation.error as Error).message}
        </p>
      )}
      <PillButton type="submit" variant="light" disabled={busy}>
        {submitLabel}
      </PillButton>
    </div>
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex h-full flex-col gap-6 md:flex-row"
    >
      <div className="md:w-[42%] md:shrink-0">{photosPanel}</div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
          {fieldsBody}
        </div>
        {footer}
      </div>
    </form>
  );
}
