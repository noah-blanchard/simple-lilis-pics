"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/api/schemas";
import { type PhotoWithTags, resolveImageUrl, type TagRow } from "@/types/db";

const schema = z.object({
  title_en: z.string().min(1, "Required"),
  title_fr: z.string().min(1, "Required"),
  shoot_date: z.string().min(1, "Required"),
  featured: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

// Always compress (target ≤ 5MB; we aim a bit lower to stay under server caps).
const COMPRESSION_OPTIONS = {
  maxSizeMB: 4.5,
  maxWidthOrHeight: 2560,
  useWebWorker: true,
};

const fieldClass =
  "w-full rounded-2xl border border-line bg-panel2 px-4 py-3 text-[15px] text-white placeholder:text-white/40 outline-none transition-colors focus:border-accent";
const labelClass = "tag-mono mb-2 block uppercase text-white/70";
const errorClass = "mt-1.5 text-[13px] text-red-400";

interface PhotoFormProps {
  /** When provided, the form edits this photo (metadata + tags) instead of
   *  creating a new one. Image replacement is not supported in edit mode. */
  photo?: PhotoWithTags;
  onSuccess?: () => void;
  /** Opens the tag-management side panel (wires the modal's expandable aside). */
  onManageTags?: () => void;
}

export function PhotoForm({ photo, onSuccess, onManageTags }: PhotoFormProps) {
  const isEdit = Boolean(photo);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    () => photo?.tags.map((t) => t.id) ?? [],
  );
  const [status, setStatus] = useState<string | null>(null);

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
      title_en: photo?.title_en ?? "",
      title_fr: photo?.title_fr ?? "",
      shoot_date: photo?.shoot_date ?? "",
      featured: photo?.featured ?? false,
    },
  });

  // Manage the object-URL preview lifecycle (create mode only).
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEdit && photo) {
        return apiFetch<{ id: string }>(`/api/photos/${photo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, tag_ids: selectedTags }),
        });
      }

      if (!file) throw new Error("Please choose an image");
      setStatus("Compressing…");
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

      setStatus("Uploading…");
      const fd = new FormData();
      fd.append("title_en", values.title_en);
      fd.append("title_fr", values.title_fr);
      fd.append("shoot_date", values.shoot_date);
      fd.append("featured", String(values.featured));
      for (const id of selectedTags) fd.append("tag_ids", id);
      fd.append("file", compressed, file.name);

      return apiFetch<{ id: string }>("/api/photos", {
        method: "POST",
        body: fd,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      setStatus(null);
      onSuccess?.();
    },
    onError: () => setStatus(null),
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFileError(null);
    if (f && !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type)) {
      setFileError("Unsupported image type (JPEG, PNG, WebP or AVIF)");
      setFile(null);
      return;
    }
    setFile(f);
  };

  const toggleTag = (id: string) =>
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const onSubmit = handleSubmit((values) => mutation.mutate(values));
  const busy = mutation.isPending;
  const submitLabel = isEdit ? "Save changes" : (status ?? "Add photo");

  // ── Reusable blocks ──

  // Left column: existing image (edit) or an upload dropzone that fills with
  // the preview once a file is chosen (create). Always full height.
  const leftPanel = (
    <div className="flex h-full flex-col">
      {isEdit && photo ? (
        <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-2xl bg-ink">
          <Image
            src={resolveImageUrl(photo.image_path)}
            alt={photo.title_en}
            fill
            sizes="(max-width: 768px) 100vw, 460px"
            className="object-cover"
          />
        </div>
      ) : (
        <label
          htmlFor="photo-file"
          className="group relative flex min-h-[320px] flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-line border-dashed bg-panel2 transition-colors hover:border-accent"
        >
          {previewUrl ? (
            // biome-ignore lint/performance/noImgElement: local blob preview
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="px-6 text-center">
              <p className="text-[15px] text-white/70">
                Click to choose an image
              </p>
              <p className="mt-1 text-[12px] text-white/40">
                Compressed to ≤ 5MB before upload.
              </p>
            </div>
          )}
          <input
            id="photo-file"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      )}
      {(file || fileError) && (
        <p
          className={
            fileError ? errorClass : "mt-2 truncate text-[12px] text-white/40"
          }
        >
          {fileError ?? file?.name}
        </p>
      )}
    </div>
  );

  const fieldsBody = (
    <>
      {/* Titles */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="title_en" className={labelClass}>
            Title (EN)
          </label>
          <input
            id="title_en"
            type="text"
            className={fieldClass}
            {...register("title_en")}
          />
          {errors.title_en && (
            <p className={errorClass}>{errors.title_en.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="title_fr" className={labelClass}>
            Title (FR)
          </label>
          <input
            id="title_fr"
            type="text"
            className={fieldClass}
            {...register("title_fr")}
          />
          {errors.title_fr && (
            <p className={errorClass}>{errors.title_fr.message}</p>
          )}
        </div>
      </div>

      {/* Date + featured */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="shoot_date" className={labelClass}>
            Shoot date
          </label>
          <input
            id="shoot_date"
            type="date"
            className={`${fieldClass} [color-scheme:dark]`}
            {...register("shoot_date")}
          />
          {errors.shoot_date && (
            <p className={errorClass}>{errors.shoot_date.message}</p>
          )}
        </div>
        <div>
          <span className={labelClass}>Visibility</span>
          <label
            htmlFor="featured"
            className="flex h-[50px] cursor-pointer items-center gap-3 rounded-2xl border border-line bg-panel2 px-4"
          >
            <input
              id="featured"
              type="checkbox"
              className="h-4 w-4 accent-accent"
              {...register("featured")}
            />
            <span className="text-[14px] text-white/70">
              Featured (show on home)
            </span>
          </label>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="tag-mono text-white/70 uppercase">Tags</span>
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
                    ? "border-accent bg-accent text-ink"
                    : "border-line text-white/70 hover:border-white/40"
                }`}
              >
                {tag.label_en}
              </button>
            );
          })}
          {!tags && <span className="text-[13px] text-white/40">Loading…</span>}
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

  // ── Layout: photo / dropzone on the left (full height), scrollable fields +
  //    pinned submit on the right. Fills the modal's fixed height. ──
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex h-full flex-col gap-6 md:flex-row"
    >
      <div className="md:w-[42%] md:shrink-0">{leftPanel}</div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
          {fieldsBody}
        </div>
        {footer}
      </div>
    </form>
  );
}
