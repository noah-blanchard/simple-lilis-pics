"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import type { ContactMessageRow } from "@/types/db";

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ContactMessageRow | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => apiFetch<ContactMessageRow[]>("/api/contact"),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["messages"] });

  const setRead = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      apiFetch<ContactMessageRow>(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/contact/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setDeleting(null);
      return invalidate();
    },
  });

  const unread = messages?.filter((m) => !m.read_at).length ?? 0;

  /** Opening an unread enquiry marks it read — the same gesture, so the badge
   *  never lies about what has actually been looked at. */
  const toggleOpen = (message: ContactMessageRow) => {
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
            Messages
          </h1>
          <p className="text-[14px] text-fg/55 lg:mt-1">
            {messages
              ? `${messages.length} enquir${messages.length === 1 ? "y" : "ies"} · ${unread} unread`
              : "Loading…"}
          </p>
        </div>
      </div>

      {isLoading && <p className="text-[14px] text-fg/55">Loading…</p>}

      {messages?.length === 0 && (
        <p className="text-[14px] text-fg/55">
          No enquiries yet. Messages sent through the contact form land here.
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
                      {message.name}
                    </span>
                    <span className="text-[12px] text-fg/45">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-fg/45">
                    {message.email}
                  </span>
                  {!expanded && (
                    <span className="mt-1.5 block truncate text-[14px] text-fg/60">
                      {message.message}
                    </span>
                  )}
                </span>
              </button>

              {expanded && (
                <div className="border-line border-t px-4 py-4 sm:px-5">
                  <p className="whitespace-pre-wrap text-[15px] text-fg/80 leading-relaxed">
                    {message.message}
                  </p>

                  <div className="mt-4 flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                    <PillButton
                      variant="accent"
                      size="sm"
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        "Re: your message to Lilis Pics",
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
        title="Delete this message?"
        message={
          deleting
            ? `The enquiry from ${deleting.name} will be permanently removed.`
            : undefined
        }
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
