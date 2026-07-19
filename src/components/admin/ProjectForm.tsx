"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { Reorder, useDragControls } from "motion/react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PhotoListItem } from "@/components/admin/PhotoListItem";
import { PhotoLightbox } from "@/components/admin/PhotoLightbox";
import { TranslatableField } from "@/components/admin/TranslatableField";
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
  maxSizeMB: 6,
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

/** An existing (edit-mode) photo. Display order is the array order — position
 *  is only ever derived from the array index, at submit time. */
interface EditPhoto {
  id: string;
  img: string;
  orientation: Orientation;
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
          }))
      : [],
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Cover selection: keyed by a stable per-photo identifier (not array index,
  // which would drift after a reorder). `null` means "default to the first
  // photo" — resolved to a concrete index/id only at submit time.
  const [coverKey, setCoverKey] = useState<string | null>(null); // create mode: previewUrl
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(
    project?.cover_photo_id ?? null,
  ); // edit mode

  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    () => project?.project_tags.map((pt) => pt.tags.id) ?? [],
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Sequential upload retry (when batch POST fails with 413).
  const [uploadMode, setUploadMode] = useState<"batch" | "sequential">("batch");
  const [seqProgress, setSeqProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [seqError, setSeqError] = useState<string | null>(null);

  // Featured cap: an already-featured project doesn't count against itself.
  const othersFeatured = project?.featured ? featuredCount - 1 : featuredCount;
  const featuredLocked = !featured && othersFeatured >= MAX_FEATURED_PROJECTS;

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => apiFetch<TagRow[]>("/api/tags"),
  });

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title_en: project?.title_en ?? "",
      title_fr: project?.title_fr ?? "",
      description_en: project?.description_en ?? "",
      description_fr: project?.description_fr ?? "",
      project_date: project?.project_date ?? "",
    },
  });

  // Live values powering the per-field AI translation buttons.
  const [titleEn, titleFr, descEn, descFr] = watch([
    "title_en",
    "title_fr",
    "description_en",
    "description_fr",
  ]);

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
    const removed = newPhotos[i];
    setNewPhotos((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl);
      return prev.filter((_, idx) => idx !== i);
    });
    setCoverKey((ck) => (ck === removed.previewUrl ? null : ck));
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

  // ── Sequential upload retry (used when batch POST returns 413) ──
  const startSequentialUpload = useCallback(
    async (values: FormValues) => {
      if (isEdit) return; // sequential is create-only
      setUploadMode("sequential");
      setSeqError(null);

      try {
        // 1) Create metadata-only project
        setSeqProgress({ current: 0, total: newPhotos.length });
        const body: Record<string, string> = {};
        if (values.title_en) body.title_en = values.title_en;
        if (values.title_fr) body.title_fr = values.title_fr;
        if (values.description_en) body.description_en = values.description_en;
        if (values.description_fr) body.description_fr = values.description_fr;
        if (values.project_date) body.project_date = values.project_date;
        body.featured = String(featured);
        const metaFd = new FormData();
        for (const [k, v] of Object.entries(body)) metaFd.append(k, v);
        for (const id of selectedTags) metaFd.append("tag_ids", id);

        const project = await apiFetch<{ id: string }>("/api/projects", {
          method: "POST",
          body: metaFd,
        });
        const projectId = project.id;

        // 2) Upload each photo sequentially with 1.5s delay
        const photoIds: string[] = [];
        for (let i = 0; i < newPhotos.length; i++) {
          setSeqProgress({ current: i + 1, total: newPhotos.length });
          setSeqError(`Uploading photo ${i + 1}/${newPhotos.length}…`);

          const compressed = await imageCompression(
            newPhotos[i].file,
            COMPRESSION_OPTIONS,
          );

          const fd = new FormData();
          fd.append("file", compressed, newPhotos[i].file.name);
          fd.append("orientation", newPhotos[i].orientation);
          fd.append("position", String(i));

          const photo = await apiFetch<{ id: string }>(
            `/api/projects/${projectId}/photos`,
            { method: "POST", body: fd },
          );
          photoIds.push(photo.id);

          // 1.5s delay between uploads to keep request size low
          if (i < newPhotos.length - 1) {
            await new Promise((r) => setTimeout(r, 1500));
          }
        }

        // 3) Set cover photo
        if (photoIds.length > 0) {
          const coverIdx = Math.max(
            0,
            newPhotos.findIndex((p) => p.previewUrl === coverKey),
          );
          await apiFetch(`/api/projects/${projectId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cover_photo_id: photoIds[coverIdx] }),
          });
        }

        // 4) Done
        setSeqProgress(null);
        setSeqError(null);
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        onSuccess?.();
      } catch (err) {
        setSeqError(
          err instanceof Error ? err.message : "Sequential upload failed",
        );
        setSeqProgress(null);
      }
    },
    [
      newPhotos,
      selectedTags,
      featured,
      coverKey,
      isEdit,
      queryClient,
      onSuccess,
    ],
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
            photos: editPhotos.map((p, i) => ({
              id: p.id,
              position: i,
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
      const coverIdx = Math.max(
        0,
        newPhotos.findIndex((p) => p.previewUrl === coverKey),
      );
      fd.append("cover_index", String(coverIdx));
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
    onError: () => {
      setStatus(null);
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));
  const busy = mutation.isPending;

  // Detect 413 — the server response is not JSON so apiFetch throws
  // "Unexpected response (413)".
  const is413Error =
    mutation.isError &&
    !isEdit &&
    (mutation.error as Error).message.includes("413");

  const submitLabel = isEdit
    ? "Save changes"
    : uploadMode === "sequential"
      ? "Uploading…"
      : (status ?? "Create project");

  // Photos to page through in the lightbox — whichever list is active.
  const lightboxPhotos = isEdit
    ? editPhotos.map((p) => ({ key: p.id, src: p.img }))
    : newPhotos.map((p) => ({ key: p.previewUrl, src: p.previewUrl }));

  // ── Photos panel (left) ──
  const photosPanel = (
    <div className="flex h-full flex-col gap-3">
      {isEdit ? (
        <Reorder.Group
          as="div"
          axis="y"
          values={editPhotos}
          onReorder={setEditPhotos}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
        >
          {editPhotos.map((p, i) => (
            <DraggablePhotoItem key={p.id} value={p}>
              {(onDragHandlePointerDown) => (
                <PhotoListItem
                  src={p.img}
                  orientation={p.orientation}
                  isCover={coverPhotoId === p.id}
                  onSetOrientation={(o) => setEditOrientation(p.id, o)}
                  onSetCover={() => setCoverPhotoId(p.id)}
                  onOpenFullscreen={() => setLightboxIndex(i)}
                  onDragHandlePointerDown={onDragHandlePointerDown}
                />
              )}
            </DraggablePhotoItem>
          ))}
        </Reorder.Group>
      ) : (
        <Reorder.Group
          as="div"
          axis="y"
          values={newPhotos}
          onReorder={setNewPhotos}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
        >
          {newPhotos.map((p, i) => (
            <DraggablePhotoItem key={p.previewUrl} value={p}>
              {(onDragHandlePointerDown) => (
                <PhotoListItem
                  src={p.previewUrl}
                  orientation={p.orientation}
                  isCover={coverKey ? coverKey === p.previewUrl : i === 0}
                  onSetOrientation={(o) => setNewOrientation(i, o)}
                  onSetCover={() => setCoverKey(p.previewUrl)}
                  onRemove={() => removeNewPhoto(i)}
                  onOpenFullscreen={() => setLightboxIndex(i)}
                  onDragHandlePointerDown={onDragHandlePointerDown}
                />
              )}
            </DraggablePhotoItem>
          ))}

          {/* Add-more dropzone (< 4) — plain trailing child, not draggable */}
          {newPhotos.length < MAX_PROJECT_PHOTOS && (
            <label
              htmlFor="project-files"
              className="flex min-h-22 cursor-pointer items-center justify-center rounded-2xl border border-line border-dashed bg-panel2 px-4 text-center transition-colors hover:border-accent"
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
        </Reorder.Group>
      )}
      {fileError && <p className="text-[13px] text-red-400">{fileError}</p>}
    </div>
  );

  // ── Fields (right) ──
  const fieldsBody = (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TranslatableField
          id="title_en"
          label="Title (EN)"
          placeholder="Optional"
          registration={register("title_en")}
          fieldClass={fieldClass}
          labelClass={labelClass}
          from="fr"
          to="en"
          kind="title"
          sourceValue={titleFr}
          targetValue={titleEn}
          onTranslated={(t) => setValue("title_en", t, { shouldDirty: true })}
        />
        <TranslatableField
          id="title_fr"
          label="Title (FR)"
          placeholder="Optionnel"
          registration={register("title_fr")}
          fieldClass={fieldClass}
          labelClass={labelClass}
          from="en"
          to="fr"
          kind="title"
          sourceValue={titleEn}
          targetValue={titleFr}
          onTranslated={(t) => setValue("title_fr", t, { shouldDirty: true })}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TranslatableField
          id="description_en"
          label="Description (EN)"
          placeholder="Optional"
          multiline
          registration={register("description_en")}
          fieldClass={fieldClass}
          labelClass={labelClass}
          from="fr"
          to="en"
          kind="description"
          sourceValue={descFr}
          targetValue={descEn}
          onTranslated={(t) =>
            setValue("description_en", t, { shouldDirty: true })
          }
        />
        <TranslatableField
          id="description_fr"
          label="Description (FR)"
          placeholder="Optionnel"
          multiline
          registration={register("description_fr")}
          fieldClass={fieldClass}
          labelClass={labelClass}
          from="en"
          to="fr"
          kind="description"
          sourceValue={descEn}
          targetValue={descFr}
          onTranslated={(t) =>
            setValue("description_fr", t, { shouldDirty: true })
          }
        />
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
            className={`flex h-12.5 items-center gap-3 rounded-2xl border border-line bg-panel2 px-4 ${
              featuredLocked
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
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
      {mutation.isError && !is413Error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
          {(mutation.error as Error).message}
        </p>
      )}

      {is413Error && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[14px] text-amber-300">
          <p className="mb-2">
            Request too large — the photos couldn&apos;t be uploaded in one
            batch.
          </p>
          <PillButton
            type="button"
            variant="light"
            disabled={mutation.isPending}
            onClick={handleSubmit(startSequentialUpload)}
          >
            ⟳ Retry — upload photos one by one
          </PillButton>
        </div>
      )}

      {!is413Error && (
        <PillButton type="submit" variant="light" disabled={busy}>
          {submitLabel}
        </PillButton>
      )}
    </div>
  );

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex h-full flex-col gap-6 md:flex-row"
      >
        {uploadMode === "sequential" ? (
          <div className="flex w-full flex-col items-center justify-center gap-5 py-12">
            {seqProgress ? (
              <>
                {/* Progress bar */}
                <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{
                      width: `${(seqProgress.current / seqProgress.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-[15px] text-fg/70">
                  Uploading photo {seqProgress.current} of {seqProgress.total}
                </p>
                {seqError && (
                  <p className="text-[13px] text-fg/50">{seqError}</p>
                )}
              </>
            ) : seqError ? (
              <>
                <p className="text-[14px] text-red-400">{seqError}</p>
                <PillButton
                  type="button"
                  variant="light"
                  onClick={handleSubmit(startSequentialUpload)}
                >
                  ⟳ Retry sequential upload
                </PillButton>
              </>
            ) : null}
          </div>
        ) : (
          <>
            <div className="md:w-[42%] md:shrink-0">{photosPanel}</div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
                {fieldsBody}
              </div>
              {footer}
            </div>
          </>
        )}
      </form>

      <PhotoLightbox
        open={lightboxIndex !== null}
        photos={lightboxPhotos}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}

/** Wraps one Reorder.Item + its own useDragControls instance, so drag can be
 *  started only from a handle (not the whole card) without violating the
 *  rules of hooks inside a .map(). Keeps PhotoListItem itself motion-free. */
function DraggablePhotoItem<T>({
  value,
  children,
}: {
  value: T;
  children: (onDragHandlePointerDown: (e: React.PointerEvent) => void) => ReactNode;
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
