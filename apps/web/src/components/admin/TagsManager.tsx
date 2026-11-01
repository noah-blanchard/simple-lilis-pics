"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { TagRow } from "@/types/db";
import { ConfirmDialog } from "./ConfirmDialog";
import { TranslatableInput } from "./TranslatableInput";

const miniField =
  "min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2 text-[13px] text-fg outline-none focus:border-accent";

export function TagsManager() {
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => apiFetch<TagRow[]>("/api/tags"),
  });

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable tag list */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {tags?.map((tag) => (
          <TagRowEditor key={tag.id} tag={tag} />
        ))}
        {!tags && <p className="text-[13px] text-fg/40">Loading…</p>}
        {tags && tags.length === 0 && (
          <p className="text-[13px] text-fg/40">No tags yet.</p>
        )}
      </div>

      {/* Pinned add-a-tag section (always visible) */}
      <div className="mt-4 shrink-0 border-line border-t pt-4">
        <p className="tag-mono mb-2 text-fg/70 uppercase">Add a tag</p>
        <AddTagRow />
      </div>
    </div>
  );
}

function TagRowEditor({ tag }: { tag: TagRow }) {
  const queryClient = useQueryClient();
  const [labelEn, setLabelEn] = useState(tag.label_en);
  const [labelFr, setLabelFr] = useState(tag.label_fr);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`/api/tags/${tag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label_en: labelEn, label_fr: labelFr }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      // Projects embed their tag labels, so they go stale on rename/delete.
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const del = useMutation({
    mutationFn: () => apiFetch(`/api/tags/${tag.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      // Projects embed their tag labels, so they go stale on rename/delete.
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setConfirmOpen(false);
    },
  });

  const dirty = labelEn !== tag.label_en || labelFr !== tag.label_fr;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-panel2 p-2">
      <TranslatableInput
        value={labelEn}
        onChange={setLabelEn}
        className={miniField}
        ariaLabel={`${tag.label_en} label EN`}
        from="fr"
        to="en"
        kind="tag"
        sourceValue={labelFr}
      />
      <TranslatableInput
        value={labelFr}
        onChange={setLabelFr}
        className={miniField}
        ariaLabel={`${tag.label_en} label FR`}
        from="en"
        to="fr"
        kind="tag"
        sourceValue={labelEn}
      />
      <button
        type="button"
        disabled={!dirty || save.isPending}
        onClick={() => save.mutate()}
        className="shrink-0 rounded-lg bg-inverse px-3 py-2 font-medium text-[12px] text-on-inverse transition-opacity disabled:opacity-30"
      >
        Save
      </button>
      <button
        type="button"
        aria-label={`Delete ${tag.label_en}`}
        onClick={() => setConfirmOpen(true)}
        className="shrink-0 rounded-lg border border-line px-3 py-2 text-[12px] text-fg/60 transition-colors hover:border-danger hover:bg-danger hover:text-on-danger"
      >
        ✕
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete tag"
        message={`“${tag.label_en}” will be removed from every photo using it.`}
        loading={del.isPending}
        onConfirm={() => del.mutate()}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function AddTagRow() {
  const queryClient = useQueryClient();
  const [labelEn, setLabelEn] = useState("");
  const [labelFr, setLabelFr] = useState("");

  const add = useMutation({
    mutationFn: () =>
      apiFetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label_en: labelEn, label_fr: labelFr }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setLabelEn("");
      setLabelFr("");
    },
  });

  const valid = labelEn.trim() && labelFr.trim();

  return (
    <div>
      <div className="flex items-center gap-2">
        <TranslatableInput
          value={labelEn}
          onChange={setLabelEn}
          placeholder="Label EN"
          ariaLabel="New tag label EN"
          className={miniField}
          from="fr"
          to="en"
          kind="tag"
          sourceValue={labelFr}
        />
        <TranslatableInput
          value={labelFr}
          onChange={setLabelFr}
          placeholder="Label FR"
          ariaLabel="New tag label FR"
          className={miniField}
          from="en"
          to="fr"
          kind="tag"
          sourceValue={labelEn}
        />
        <button
          type="button"
          disabled={!valid || add.isPending}
          onClick={() => add.mutate()}
          className="shrink-0 rounded-lg bg-accent px-3 py-2 font-medium text-[12px] text-on-accent transition-opacity disabled:opacity-30"
        >
          Add
        </button>
      </div>
      {add.isError && (
        <p className="mt-2 text-[13px] text-danger">
          {(add.error as Error).message}
        </p>
      )}
    </div>
  );
}
