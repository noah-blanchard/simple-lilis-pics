"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/admin/Modal";
import { RatingQrDialog } from "@/components/admin/RatingQrDialog";
import { PillButton } from "@/components/PillButton";
import { StarIcon } from "@/components/rate/StarIcon";
import { apiFetch } from "@/lib/api/client";
import { MIN_PUBLIC_TESTIMONIALS } from "@/lib/rating";
import type { RatingRow } from "@/types/db";

const STARS = [1, 2, 3, 4, 5];

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} out of 5`}>
      {STARS.map((star) => (
        <span
          key={star}
          className={star <= value ? "text-accent" : "text-line-strong"}
        >
          <StarIcon className="h-4 w-4" filled={star <= value} />
        </span>
      ))}
    </span>
  );
}

export default function AdminRatingsPage() {
  const queryClient = useQueryClient();
  const [qrOpen, setQrOpen] = useState(false);
  const [deleting, setDeleting] = useState<RatingRow | null>(null);

  const { data: ratings, isLoading } = useQuery({
    queryKey: ["ratings"],
    queryFn: () => apiFetch<RatingRow[]>("/api/ratings"),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["ratings"] });

  const approve = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      apiFetch<RatingRow>(`/api/ratings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/ratings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setDeleting(null);
      return invalidate();
    },
  });

  const approvedWithNote =
    ratings?.filter((r) => r.approved && r.note?.trim()).length ?? 0;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {/* On mobile the section title already lives in the top bar. */}
          <h1 className="hidden font-semibold text-[26px] tracking-tight lg:block">
            Ratings
          </h1>
          <p className="text-[14px] text-fg/55 lg:mt-1">
            {ratings
              ? `${ratings.length} rating${ratings.length === 1 ? "" : "s"} · ${approvedWithNote}/${MIN_PUBLIC_TESTIMONIALS} approved with a note`
              : "Loading…"}
          </p>
        </div>
        <PillButton variant="light" size="sm" onClick={() => setQrOpen(true)}>
          Generate QR
        </PillButton>
      </div>

      {/* The public testimonials section stays hidden below this threshold, so
          say it out loud rather than letting it look broken. */}
      {ratings && approvedWithNote < MIN_PUBLIC_TESTIMONIALS && (
        <p className="mb-6 rounded-2xl border border-accent-line bg-accent-soft px-5 py-4 text-[14px] text-accent">
          The testimonials section on the home page stays hidden until{" "}
          {MIN_PUBLIC_TESTIMONIALS} ratings with a written note are approved.
        </p>
      )}

      {isLoading && <p className="text-[14px] text-fg/55">Loading…</p>}

      {ratings?.length === 0 && (
        <p className="text-[14px] text-fg/55">
          No ratings yet. Generate a QR and hand it to someone you just
          photographed.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {ratings?.map((rating) => (
          <li
            key={rating.id}
            className="rounded-card border border-line bg-panel p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Stars value={rating.stars} />
              <span className="text-[12px] text-fg/45">
                {new Date(rating.created_at).toLocaleDateString()} ·{" "}
                {rating.locale.toUpperCase()}
              </span>
            </div>

            {rating.note ? (
              <p className="mt-3 text-[15px] text-fg/80 leading-relaxed">
                “{rating.note}”
              </p>
            ) : (
              <p className="mt-3 text-[14px] text-fg/40 italic">
                No note — stars only, so it can't appear in the testimonials.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[14px] text-fg/60">
                {rating.name ?? "Anonymous"}
              </span>
              <div className="flex items-center gap-2">
                <PillButton
                  variant={rating.approved ? "accent" : "ghost"}
                  size="sm"
                  disabled={!rating.note?.trim() || approve.isPending}
                  onClick={() =>
                    approve.mutate({
                      id: rating.id,
                      approved: !rating.approved,
                    })
                  }
                >
                  {rating.approved ? "Published" : "Publish"}
                </PillButton>
                <PillButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleting(rating)}
                >
                  Delete
                </PillButton>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Rating QR code"
        baseWidthRem={26}
      >
        <RatingQrDialog open={qrOpen} />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this rating?"
        message="It disappears from the testimonials too. The link stays spent, so it can't be reused."
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
