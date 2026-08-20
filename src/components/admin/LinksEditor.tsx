"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Reorder } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Sheet } from "@/components/admin/Sheet";
import { LinkCard } from "@/components/links/LinkCard";
import { LinksPageContent } from "@/components/links/LinksPageContent";
import type { Locale } from "@/i18n/routing";
import { apiFetch } from "@/lib/api/client";
import {
  type LinkEditorItemInput,
  linksEditorSaveSchema,
} from "@/lib/api/schemas";
import { publicFontVariables } from "@/lib/fonts";
import { LINK_ICON_REGISTRY } from "@/lib/links/icons";
import { useIsDesktop } from "@/lib/use-media-query";
import type {
  AdminLinksSnapshot,
  LinkClickStat,
  LinkRow,
  ResolvedLink,
} from "@/types/db";
import { PillButton } from "../PillButton";

type EditorLink = LinkEditorItemInput;

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-line-strong bg-ink px-3 py-2.5 text-[14px] outline-none focus:border-accent";
const labelClass = "block text-[12px] font-medium text-fg/60";

function toEditorLink(row: LinkRow): EditorLink {
  return {
    client_id: row.id,
    id: row.id,
    name_en: row.name_en,
    name_fr: row.name_fr,
    subtitle_en: row.subtitle_en,
    subtitle_fr: row.subtitle_fr,
    url: row.url,
    icon_key: row.icon_key,
    published: row.published,
    open_behavior: row.open_behavior,
    updated_at: row.updated_at,
  };
}

function resolveDraft(
  item: EditorLink,
  locale: Locale,
  position: number,
): ResolvedLink {
  const name =
    locale === "fr"
      ? item.name_fr || item.name_en || "Lien sans titre"
      : item.name_en || item.name_fr || "Untitled link";
  const subtitle =
    locale === "fr"
      ? item.subtitle_fr || item.subtitle_en
      : item.subtitle_en || item.subtitle_fr;
  return {
    id: item.client_id,
    name,
    subtitle: subtitle || null,
    url: item.url,
    iconKey: item.icon_key,
    position,
    openBehavior: item.open_behavior,
  };
}

function makeDraft(): EditorLink {
  return {
    client_id: crypto.randomUUID(),
    id: null,
    name_en: "New link",
    name_fr: "Nouveau lien",
    subtitle_en: null,
    subtitle_fr: null,
    url: "https://",
    icon_key: "website",
    published: false,
    open_behavior: "new_tab",
    updated_at: null,
  };
}

function variationLabel(stat?: LinkClickStat) {
  if (!stat) return "0%";
  const current = Number(stat.current_period);
  const previous = Number(stat.previous_period);
  if (previous === 0) return current > 0 ? "New" : "0%";
  const percent = Math.round(((current - previous) / previous) * 100);
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

function LinkInspector({
  item,
  stat,
  index,
  total,
  onChange,
  onMove,
  onDelete,
}: {
  item: EditorLink;
  stat?: LinkClickStat;
  index: number;
  total: number;
  onChange: (next: EditorLink) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}) {
  const set = <K extends keyof EditorLink>(key: K, value: EditorLink[K]) =>
    onChange({ ...item, [key]: value });

  return (
    <div className="h-full space-y-5 overflow-y-auto pr-1 pb-4">
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-ink p-3 text-center">
        <div>
          <strong className="block text-[17px]">
            {Number(stat?.total ?? 0)}
          </strong>
          <span className="text-[10px] text-fg/45">Total</span>
        </div>
        <div>
          <strong className="block text-[17px]">
            {Number(stat?.current_period ?? 0)}
          </strong>
          <span className="text-[10px] text-fg/45">Last 7 days</span>
        </div>
        <div>
          <strong className="block text-[17px]">{variationLabel(stat)}</strong>
          <span className="text-[10px] text-fg/45">Change</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Name (EN)
          <input
            value={item.name_en ?? ""}
            onChange={(e) => set("name_en", e.target.value || null)}
            className={fieldClass}
            maxLength={120}
          />
        </label>
        <label className={labelClass}>
          Name (FR)
          <input
            value={item.name_fr ?? ""}
            onChange={(e) => set("name_fr", e.target.value || null)}
            className={fieldClass}
            maxLength={120}
          />
        </label>
        <label className={labelClass}>
          Subtitle (EN)
          <textarea
            value={item.subtitle_en ?? ""}
            onChange={(e) => set("subtitle_en", e.target.value || null)}
            className={`${fieldClass} min-h-20 resize-y`}
            maxLength={240}
          />
        </label>
        <label className={labelClass}>
          Subtitle (FR)
          <textarea
            value={item.subtitle_fr ?? ""}
            onChange={(e) => set("subtitle_fr", e.target.value || null)}
            className={`${fieldClass} min-h-20 resize-y`}
            maxLength={240}
          />
        </label>
      </div>

      <label className={labelClass}>
        Destination URL
        <input
          value={item.url}
          onChange={(e) => set("url", e.target.value)}
          className={fieldClass}
          inputMode="url"
        />
      </label>

      <fieldset>
        <legend className={labelClass}>Icon</legend>
        <div className="mt-2 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => set("icon_key", null)}
            aria-pressed={item.icon_key === null}
            className={`min-h-14 rounded-xl border text-[11px] ${item.icon_key === null ? "border-accent bg-accent-soft text-accent" : "border-line"}`}
          >
            None
          </button>
          {LINK_ICON_REGISTRY.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => set("icon_key", key)}
              aria-pressed={item.icon_key === key}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] ${item.icon_key === key ? "border-accent bg-accent-soft text-accent" : "border-line"}`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Opening
          <select
            value={item.open_behavior}
            disabled={item.url.startsWith("mailto:")}
            onChange={(e) =>
              set(
                "open_behavior",
                e.target.value as EditorLink["open_behavior"],
              )
            }
            className={fieldClass}
          >
            <option value="same_tab">Same tab</option>
            <option value="new_tab">New tab</option>
          </select>
        </label>
        <label className={labelClass}>
          Visibility
          <select
            value={item.published ? "published" : "draft"}
            onChange={(e) => set("published", e.target.value === "published")}
            className={fieldClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <PillButton
          size="sm"
          variant="ghost"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="min-h-11 flex-1"
        >
          ↑ Move up
        </PillButton>
        <PillButton
          size="sm"
          variant="ghost"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          className="min-h-11 flex-1"
        >
          ↓ Move down
        </PillButton>
      </div>
      <PillButton
        size="sm"
        variant="danger"
        onClick={onDelete}
        className="min-h-11 w-full"
      >
        Delete link
      </PillButton>
      {stat?.last_clicked_at && (
        <p className="text-[11px] text-fg/40">
          Last click {new Date(stat.last_clicked_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function LinksEditor() {
  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();
  const [items, setItems] = useState<EditorLink[]>([]);
  const [baseline, setBaseline] = useState<EditorLink[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [mobileInspector, setMobileInspector] = useState(false);
  const [deleting, setDeleting] = useState<EditorLink | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["links"],
    queryFn: () => apiFetch<AdminLinksSnapshot>("/api/links"),
  });

  useEffect(() => {
    if (!query.data) return;
    const next = query.data.links.map(toEditorLink);
    setItems(next);
    setBaseline(next);
    setSelectedId((current) => current ?? next[0]?.client_id ?? null);
  }, [query.data]);

  const dirty = JSON.stringify(items) !== JSON.stringify(baseline);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        expected_items: baseline.flatMap((item) =>
          item.id && item.updated_at
            ? [{ id: item.id, updated_at: item.updated_at }]
            : [],
        ),
        items,
      };
      const checked = linksEditorSaveSchema.safeParse(payload);
      if (!checked.success)
        throw new Error(checked.error.issues[0]?.message ?? "Invalid links");
      return apiFetch<AdminLinksSnapshot>("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checked.data),
      });
    },
    onSuccess: (snapshot) => {
      queryClient.setQueryData(["links"], snapshot);
      setMessage("Links saved and public page refreshed.");
    },
  });

  const selectedIndex = items.findIndex(
    (item) => item.client_id === selectedId,
  );
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;
  const stats = useMemo(
    () => new Map(query.data?.stats.map((stat) => [stat.link_id, stat])),
    [query.data?.stats],
  );
  const previewLinks = items.map((item, index) =>
    resolveDraft(item, locale, index),
  );
  const openInspector = (id: string) => {
    setSelectedId(id);
    if (isDesktop === false) setMobileInspector(true);
  };

  const updateSelected = (next: EditorLink) =>
    setItems((current) =>
      current.map((item) => (item.client_id === next.client_id ? next : item)),
    );
  const moveSelected = (direction: -1 | 1) => {
    if (!selected) return;
    const target = selectedIndex + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[selectedIndex], next[target]] = [next[target], next[selectedIndex]];
    setItems(next);
    setMessage(
      `${selected.name_en ?? selected.name_fr ?? "Link"} moved to position ${target + 1}.`,
    );
  };
  const inspector = selected ? (
    <LinkInspector
      item={selected}
      stat={selected.id ? stats.get(selected.id) : undefined}
      index={selectedIndex}
      total={items.length}
      onChange={updateSelected}
      onMove={moveSelected}
      onDelete={() => setDeleting(selected)}
    />
  ) : (
    <p className="text-[14px] text-fg/50">Select a link to edit it.</p>
  );

  if (query.isLoading)
    return <p className="text-[14px] text-fg/55">Loading editor…</p>;
  if (query.isError)
    return (
      <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-danger">
        {(query.error as Error).message}
      </p>
    );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="hidden font-semibold text-[26px] tracking-tight lg:block">
            Links editor
          </h1>
          <p className="text-[13px] text-fg/50 lg:mt-1">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <PillButton
            size="sm"
            variant="ghost"
            onClick={() => {
              setItems(baseline);
              setMessage("Draft discarded.");
            }}
            disabled={!dirty}
            className="min-h-11 flex-1"
          >
            Discard
          </PillButton>
          <PillButton
            size="sm"
            variant="ghost"
            onClick={() => {
              const next = makeDraft();
              setItems((current) => [...current, next]);
              setSelectedId(next.client_id);
              if (isDesktop === false) setMobileInspector(true);
            }}
            className="min-h-11 flex-1"
          >
            + Add link
          </PillButton>
          <PillButton
            size="sm"
            onClick={() => save.mutate()}
            disabled={!dirty || save.isPending}
            className="min-h-11 flex-1"
          >
            {save.isPending ? "Saving…" : "Save"}
          </PillButton>
        </div>
      </div>

      {(message || save.isError) && (
        <div
          role={save.isError ? "alert" : "status"}
          className={`mb-4 rounded-xl border px-4 py-3 text-[13px] ${save.isError ? "border-danger/30 bg-danger/10 text-danger" : "border-accent-line bg-accent-soft text-accent"}`}
        >
          <p>{save.isError ? (save.error as Error).message : message}</p>
          {save.isError && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-danger/30 px-3 py-1.5 font-medium text-[11px]"
                onClick={() => {
                  save.reset();
                  void query.refetch();
                }}
              >
                Reload server version
              </button>
              <button
                type="button"
                className="rounded-full border border-danger/30 px-3 py-1.5 font-medium text-[11px]"
                onClick={() => save.reset()}
              >
                Keep my draft
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(380px,1fr)_400px]">
        <div className="rounded-card border border-line bg-panel2 p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="tag-mono">LIVE MOBILE PREVIEW</span>
            <div className="flex rounded-full border border-line bg-ink p-1">
              {(["en", "fr"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLocale(value)}
                  className={`rounded-full px-3 py-1 text-[11px] uppercase ${locale === value ? "bg-inverse text-on-inverse" : "text-fg/50"}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div
            className={`${publicFontVariables} mx-auto max-h-[760px] max-w-[420px] overflow-y-auto rounded-[32px] border border-line bg-ink shadow-xl`}
          >
            <LinksPageContent
              links={previewLinks}
              locale={locale}
              description={
                locale === "fr"
                  ? "Photographie, travaux récents et les endroits où me retrouver."
                  : "Photography, recent work and the places where you can find me."
              }
              emptyLabel="No links yet."
              linksLabel="Editor preview"
              opensNewTabLabel="opens in a new tab"
              mode="editor"
              selectedId={selectedId}
              onSelect={openInspector}
              localeControl={
                <span className="tag-mono uppercase">{locale}</span>
              }
              listContent={
                items.length === 0 ? undefined : (
                  <nav aria-label="Editor preview">
                    <Reorder.Group
                      axis="y"
                      values={items}
                      onReorder={(next) => {
                        setItems(next);
                        setMessage("Order changed. Save to publish it.");
                      }}
                      className="flex flex-col gap-3"
                    >
                      {items.map((item, index) => (
                        <Reorder.Item
                          key={item.client_id}
                          value={item}
                          className="relative cursor-grab list-none active:cursor-grabbing"
                        >
                          <span
                            aria-hidden
                            className="-left-5 -translate-y-1/2 absolute top-1/2 hidden text-fg/30 sm:block"
                          >
                            ⋮
                          </span>
                          <LinkCard
                            link={previewLinks[index]}
                            locale={locale}
                            mode="editor"
                            opensNewTabLabel="opens in a new tab"
                            selected={selectedId === item.client_id}
                            onSelect={() => openInspector(item.client_id)}
                          />
                          {!item.published && (
                            <span className="absolute top-2 right-10 rounded-full bg-inverse px-2 py-0.5 text-[9px] text-on-inverse uppercase">
                              Draft
                            </span>
                          )}
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </nav>
                )
              }
            />
          </div>
        </div>
        <aside className="sticky top-8 hidden max-h-[calc(100vh-4rem)] rounded-card border border-line bg-panel p-5 lg:block">
          <h2 className="mb-5 font-semibold text-[17px]">Link properties</h2>
          {inspector}
        </aside>
      </div>

      <Sheet
        open={mobileInspector && !!selected}
        onClose={() => setMobileInspector(false)}
        title="Link properties"
      >
        {inspector}
      </Sheet>
      <ConfirmDialog
        open={!!deleting}
        title="Delete this link?"
        message="Saving will permanently delete this link and all of its click statistics."
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          setItems((current) =>
            current.filter((item) => item.client_id !== deleting.client_id),
          );
          setSelectedId(null);
          setDeleting(null);
          setMobileInspector(false);
        }}
      />
    </div>
  );
}
