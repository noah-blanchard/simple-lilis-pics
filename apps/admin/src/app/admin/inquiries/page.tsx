"use client";

import { apiFetch } from "@lili/core/api/client";
import type { WeddingInquiryRow } from "@lili/core/types/db";
import { PillButton } from "@lili/ui/components/PillButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const GUESTS: Record<string, string> = {
  under_20: "Fewer than 20",
  "20_60": "20 to 60",
  "60_120": "60 to 120",
  over_120: "More than 120",
};
const COLLECTIONS: Record<string, string> = {
  elopement: "Elopement",
  intimate: "Intimate",
  full_day: "Full day",
  unsure: "Not sure yet",
};
const BUDGETS: Record<string, string> = {
  under_3000: "Under $3,000",
  "3000_4500": "$3,000 to $4,500",
  "4500_6000": "$4,500 to $6,000",
  over_6000: "More than $6,000",
  unsure: "Would rather talk about it",
};

/** Every field of an inquiry as English label/value pairs. */
function details(row: WeddingInquiryRow): [string, string][] {
  return [
    ["Names", row.names],
    ["Email", row.email],
    ["Wedding date", row.wedding_date ?? "Not set yet"],
    ["Venue or city", row.venue],
    ["Guests", row.guests ? GUESTS[row.guests] : "-"],
    ["Collection", row.collection ? COLLECTIONS[row.collection] : "-"],
    ["Budget", row.budget ? BUDGETS[row.budget] : "-"],
    ["Heard from", row.heard_from || "-"],
    ["Language", row.locale === "fr" ? "French" : "English"],
    ["Message", row.message || "-"],
  ];
}

export default function AdminInquiriesPage() {
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<WeddingInquiryRow | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["wedding-inquiries"],
    queryFn: () => apiFetch<WeddingInquiryRow[]>("/api/wedding-inquiries"),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["wedding-inquiries"] });

  const setRead = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      apiFetch<WeddingInquiryRow>(`/api/wedding-inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/wedding-inquiries/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      setDeleting(null);
      return invalidate();
    },
  });

  const unread = messages?.filter((m) => !m.read_at).length ?? 0;

  /** Opening an unread enquiry marks it read — the same gesture, so the badge
   *  never lies about what has actually been looked at. */
  const toggleOpen = (message: WeddingInquiryRow) => {
    const nowOpen = openId === message.id ? null : message.id;
    setOpenId(nowOpen);
    if (nowOpen && !message.read_at) {
      setRead.mutate({ id: message.id, read: true });
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {/* On mobile the section title already lives in the top bar. */}
          <h1 className="hidden font-semibold text-[26px] tracking-tight lg:block">
            Wedding inquiries
          </h1>
          <p className="text-[14px] text-fg/55 lg:mt-1">
            {messages
              ? `${messages.length} inquir${messages.length === 1 ? "y" : "ies"} · ${unread} unread`
              : "Loading…"}
          </p>
        </div>
      </div>

      {isLoading && <p className="text-[14px] text-fg/55">Loading…</p>}

      {messages?.length === 0 && (
        <p className="text-[14px] text-fg/55">
          No wedding inquiries yet. Reply cards sent from wedding.lilispics.com
          land here.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {messages?.map((message) => {
          const expanded = openId === message.id;
          return (
            <li
              key={message.id}
              className="overflow-hidden rounded-card border border-line bg-panel"
            >
              <button
                type="button"
                onClick={() => toggleOpen(message)}
                aria-expanded={expanded}
                className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
              >
                <span
                  aria-hidden
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                    message.read_at ? "bg-transparent" : "bg-accent"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span
                      className={`text-[15px] ${
                        message.read_at ? "text-fg/70" : "font-semibold text-fg"
                      }`}
                    >
                      {message.names}
                    </span>
                    <span className="text-[12px] text-fg/45">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-fg/45">
                    {message.wedding_date ?? "No date yet"} · {message.venue}
                  </span>
                </span>
              </button>

              {expanded && (
                <div className="border-line border-t px-4 py-4 sm:px-5">
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-2">
                    {details(message).map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-fg/45">{label}</dt>
                        <dd className="whitespace-pre-wrap text-fg/80">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                    <PillButton
                      variant="accent"
                      size="sm"
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        "Re: your wedding inquiry",
                      )}`}
                      className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
                    >
                      Reply
                    </PillButton>
                    <PillButton
                      variant="ghost"
                      size="sm"
                      disabled={setRead.isPending}
                      onClick={() =>
                        setRead.mutate({ id: message.id, read: false })
                      }
                      className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
                    >
                      Mark unread
                    </PillButton>
                    <PillButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(message)}
                      className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
                    >
                      Delete
                    </PillButton>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this inquiry?"
        message={
          deleting
            ? `The inquiry from ${deleting.names} will be permanently removed.`
            : undefined
        }
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
