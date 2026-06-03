"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { apiFetch } from "@/lib/api/client";
import { type PhotoWithTags, resolveImageUrl } from "@/types/db";

export default function AdminDashboard() {
  const {
    data: photos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photos"],
    queryFn: () => apiFetch<PhotoWithTags[]>("/api/photos"),
  });

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[26px] tracking-tight">Photos</h1>
          <p className="mt-1 text-[14px] text-white/55">
            {photos ? `${photos.length} in the portfolio` : "Loading…"}
          </p>
        </div>
      </div>

      {isLoading && <p className="text-white/55">Loading photos…</p>}

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
            <AdminPhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPhotoCard({ photo }: { photo: PhotoWithTags }) {
  const year = photo.shoot_date.slice(0, 4);
  const tags = photo.tags.map((t) => t.label_en).join(", ");

  return (
    <article className="group overflow-hidden rounded-card bg-panel">
      <div className="relative aspect-[4/5] overflow-hidden">
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
      </div>
    </article>
  );
}
