"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { Reorder } from "motion/react";
import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Sheet } from "@/components/admin/Sheet";
import { LinkCard } from "@/components/links/LinkCard";
import { LinksPageContent } from "@/components/links/LinksPageContent";
import type { Locale } from "@/i18n/routing";
import { apiFetch } from "@/lib/api/client";
import {
  type LinkEditorItemInput,
  linksEditorSaveSchema,
  type SocialEditorItemInput,
} from "@/lib/api/schemas";
import { publicFontVariables } from "@/lib/fonts";
import { LINK_ICON_REGISTRY } from "@/lib/links/icons";
import { getSocialIcon, SOCIAL_ICON_REGISTRY } from "@/lib/links/social-icons";
import { useIsDesktop } from "@/lib/use-media-query";
import type {
  AdminLinksSnapshot,
  LinkClickStat,
  LinkRow,
  LinksPageSettingsRow,
  ResolvedLink,
  ResolvedSocialLink,
  SocialLinkClickStat,
  SocialLinkRow,
} from "@/types/db";
import { resolveImageUrl } from "@/types/db";
import { PillButton } from "../PillButton";

type EditorLink = LinkEditorItemInput;
type EditorSocial = SocialEditorItemInput;
type BannerAction = "keep" | "replace" | "remove";
type InspectorMode = "page" | "social" | "link";
type PageDraft = Pick<
  LinksPageSettingsRow,
  "banner_focal_x" | "banner_focal_y" | "tagline_en" | "tagline_fr"
>;

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-line-strong bg-ink px-3 py-2.5 text-[14px] outline-none focus:border-accent";
const labelClass = "block text-[12px] font-medium text-fg/60";
const defaultCopy = {
  en: "Photography, recent work and the places where you can find me.",
  fr: "Photographie, travaux récents et les endroits où me retrouver.",
};

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

function toEditorSocial(row: SocialLinkRow): EditorSocial {
  return {
    client_id: row.id,
    id: row.id,
    label_en: row.label_en,
    label_fr: row.label_fr,
    url: row.url,
    icon_key: row.icon_key,
    published: row.published,
    updated_at: row.updated_at,
  };
}

function toPageDraft(settings: LinksPageSettingsRow): PageDraft {
  return {
    banner_focal_x: settings.banner_focal_x,
    banner_focal_y: settings.banner_focal_y,
    tagline_en: settings.tagline_en,
    tagline_fr: settings.tagline_fr,
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

function resolveSocialDraft(
  item: EditorSocial,
  locale: Locale,
  position: number,
): ResolvedSocialLink {
  const definition = SOCIAL_ICON_REGISTRY.find(
    ({ key }) => key === item.icon_key,
  );
  const label =
    locale === "fr"
      ? item.label_fr || item.label_en || definition?.label || "Réseau social"
      : item.label_en || item.label_fr || definition?.label || "Social profile";
  return {
    id: item.client_id,
    label,
    url: item.url,
    iconKey: item.icon_key,
    position,
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

function makeSocialDraft(): EditorSocial {
  return {
    client_id: crypto.randomUUID(),
    id: null,
    label_en: "Instagram",
    label_fr: "Instagram",
    url: "https://",
    icon_key: "instagram",
    published: false,
    updated_at: null,
  };
}

function variationLabel(
  stat?: Pick<LinkClickStat, "current_period" | "previous_period">,
) {
  if (!stat) return "0%";
  const current = Number(stat.current_period);
  const previous = Number(stat.previous_period);
  if (previous === 0) return current > 0 ? "New" : "0%";
  const percent = Math.round(((current - previous) / previous) * 100);
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

function PageInspector({
  settings,
  bannerUrl,
  onChange,
  onChooseBanner,
  onRemoveBanner,
}: {
  settings: PageDraft;
  bannerUrl: string | null;
  onChange: (next: PageDraft) => void;
  onChooseBanner: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveBanner: () => void;
}) {
  const focalRef = useRef<HTMLDivElement>(null);
  const set = <K extends keyof PageDraft>(key: K, value: PageDraft[K]) =>
    onChange({ ...settings, [key]: value });
  const updateFocal = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = focalRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = Math.round(((event.clientX - bounds.left) / bounds.width) * 100);
    const y = Math.round(((event.clientY - bounds.top) / bounds.height) * 100);
    onChange({
      ...settings,
      banner_focal_x: Math.max(0, Math.min(100, x)),
      banner_focal_y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <div className="h-full space-y-5 overflow-y-auto pr-1 pb-4">
      <div>
        <span className={labelClass}>Banner image</span>
        <div
          ref={focalRef}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFocal(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              updateFocal(event);
          }}
          className="relative mt-2 aspect-[16/8] touch-none overflow-hidden rounded-2xl bg-[linear-gradient(145deg,var(--accent-strong),var(--accent),var(--accent-soft))]"
        >
          {bannerUrl && (
            <div
              className="absolute inset-0 bg-cover"
              style={{
                backgroundImage: `url(${JSON.stringify(bannerUrl)})`,
                backgroundPosition: `${settings.banner_focal_x}% ${settings.banner_focal_y}%`,
              }}
            />
          )}
          <span
            aria-hidden
            className="-translate-x-1/2 -translate-y-1/2 absolute h-7 w-7 rounded-full border-2 border-white bg-black/25 shadow-lg"
            style={{
              left: `${settings.banner_focal_x}%`,
              top: `${settings.banner_focal_y}%`,
            }}
          />
        </div>
        <p className="mt-2 text-[11px] text-fg/45">
          Drag the target to keep the important part of the photo visible.
        </p>
        <div className="mt-3 flex gap-2">
          <label className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-inverse px-4 text-[12px] text-on-inverse">
            {bannerUrl ? "Replace image" : "Choose image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={onChooseBanner}
              className="sr-only"
            />
          </label>
          {bannerUrl && (
            <PillButton
              size="sm"
              variant="ghost"
              onClick={onRemoveBanner}
              className="min-h-11 flex-1"
            >
              Remove
            </PillButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["banner_focal_x", "banner_focal_y"] as const).map((key) => (
          <label key={key} className={labelClass}>
            {key.endsWith("x") ? "Horizontal focus" : "Vertical focus"}
            <input
              type="range"
              min={0}
              max={100}
              value={settings[key]}
              onChange={(event) => set(key, Number(event.target.value))}
              className="mt-3 w-full accent-accent"
            />
            <span className="mt-1 block text-center text-[11px] text-fg/45">
              {settings[key]}%
            </span>
          </label>
        ))}
      </div>

      <label className={labelClass}>
        Welcome phrase (EN)
        <textarea
          value={settings.tagline_en ?? ""}
          onChange={(event) => set("tagline_en", event.target.value || null)}
          maxLength={160}
          className={`${fieldClass} min-h-20 resize-y`}
        />
      </label>
      <label className={labelClass}>
        Welcome phrase (FR)
        <textarea
          value={settings.tagline_fr ?? ""}
          onChange={(event) => set("tagline_fr", event.target.value || null)}
          maxLength={160}
          className={`${fieldClass} min-h-20 resize-y`}
        />
      </label>
    </div>
  );
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

function SocialInspector({
  items,
  selectedId,
  stat,
  onSelect,
  onReorder,
  onChange,
  onMove,
  onDelete,
}: {
  items: EditorSocial[];
  selectedId: string | null;
  stat?: SocialLinkClickStat;
  onSelect: (id: string) => void;
  onReorder: (items: EditorSocial[]) => void;
  onChange: (item: EditorSocial) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [iconSearch, setIconSearch] = useState("");
  const selectedIndex = items.findIndex(
    (item) => item.client_id === selectedId,
  );
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;
  const matchingIcons = SOCIAL_ICON_REGISTRY.filter((definition) =>
    `${definition.label} ${definition.key}`
      .toLowerCase()
      .includes(iconSearch.trim().toLowerCase()),
  );
  const set = <K extends keyof EditorSocial>(
    key: K,
    value: EditorSocial[K],
  ) => {
    if (selected) onChange({ ...selected, [key]: value });
  };

  return (
    <div className="h-full space-y-5 overflow-y-auto pr-1 pb-4">
      {items.length === 0 ? (
        <p className="rounded-xl border border-line bg-ink px-3 py-4 text-center text-[12px] text-fg/50">
          No social links yet. Use Add social to create one.
        </p>
      ) : (
        <div>
          <span className={labelClass}>Order</span>
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={onReorder}
            className="mt-2 space-y-2"
          >
            {items.map((item) => {
              const Icon = getSocialIcon(item.icon_key);
              const label =
                item.label_en || item.label_fr || "Untitled social link";
              return (
                <Reorder.Item
                  key={item.client_id}
                  value={item}
                  className="cursor-grab list-none active:cursor-grabbing"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.client_id)}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 text-left ${selectedId === item.client_id ? "border-accent bg-accent-soft" : "border-line bg-ink"}`}
                  >
                    <Icon aria-hidden className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-[12px]">
                      {label}
                    </span>
                    {!item.published && (
                      <span className="text-[9px] text-fg/40 uppercase">
                        Draft
                      </span>
                    )}
                    <span aria-hidden className="text-fg/30">
                      ⋮
                    </span>
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      )}

      {selected && (
        <>
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
              <strong className="block text-[17px]">
                {variationLabel(stat)}
              </strong>
              <span className="text-[10px] text-fg/45">Change</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Tooltip / label (EN)
              <input
                value={selected.label_en ?? ""}
                onChange={(event) =>
                  set("label_en", event.target.value || null)
                }
                maxLength={120}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Tooltip / label (FR)
              <input
                value={selected.label_fr ?? ""}
                onChange={(event) =>
                  set("label_fr", event.target.value || null)
                }
                maxLength={120}
                className={fieldClass}
              />
            </label>
          </div>
          <label className={labelClass}>
            Social URL
            <input
              value={selected.url}
              onChange={(event) => set("url", event.target.value)}
              inputMode="url"
              className={fieldClass}
            />
          </label>
          <fieldset>
            <legend className={labelClass}>Social icon</legend>
            <input
              value={iconSearch}
              onChange={(event) => setIconSearch(event.target.value)}
              placeholder="Search icons"
              className={fieldClass}
            />
            <div className="mt-2 grid grid-cols-4 gap-2">
              {matchingIcons.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("icon_key", key)}
                  aria-pressed={selected.icon_key === key}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-1 text-[9px] ${selected.icon_key === key ? "border-accent bg-accent-soft text-accent" : "border-line"}`}
                >
                  <Icon aria-hidden className="h-5 w-5" />
                  <span className="max-w-full truncate">{label}</span>
                </button>
              ))}
            </div>
            {matchingIcons.length === 0 && (
              <p className="mt-2 text-[11px] text-fg/45">
                No matching social icon.
              </p>
            )}
          </fieldset>
          <label className={labelClass}>
            Visibility
            <select
              value={selected.published ? "published" : "draft"}
              onChange={(event) =>
                set("published", event.target.value === "published")
              }
              className={fieldClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <div className="flex gap-2">
            <PillButton
              size="sm"
              variant="ghost"
              disabled={selectedIndex === 0}
              onClick={() => onMove(-1)}
              className="min-h-11 flex-1"
            >
              ↑ Move up
            </PillButton>
            <PillButton
              size="sm"
              variant="ghost"
              disabled={selectedIndex === items.length - 1}
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
            Delete social link
          </PillButton>
          {stat?.last_clicked_at && (
            <p className="text-[11px] text-fg/40">
              Last click {new Date(stat.last_clicked_at).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function LinksEditor() {
  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();
  const [items, setItems] = useState<EditorLink[]>([]);
  const [baseline, setBaseline] = useState<EditorLink[]>([]);
  const [socialItems, setSocialItems] = useState<EditorSocial[]>([]);
  const [socialBaseline, setSocialBaseline] = useState<EditorSocial[]>([]);
  const [settings, setSettings] = useState<PageDraft | null>(null);
  const [settingsBaseline, setSettingsBaseline] = useState<PageDraft | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSocialId, setSelectedSocialId] = useState<string | null>(null);
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>("page");
  const [locale, setLocale] = useState<Locale>("en");
  const [mobileInspector, setMobileInspector] = useState(false);
  const [deleting, setDeleting] = useState<EditorLink | null>(null);
  const [deletingSocial, setDeletingSocial] = useState<EditorSocial | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerAction, setBannerAction] = useState<BannerAction>("keep");
  const [previewKey, setPreviewKey] = useState(0);

  const query = useQuery({
    queryKey: ["links"],
    queryFn: () => apiFetch<AdminLinksSnapshot>("/api/links"),
  });

  useEffect(() => {
    if (!query.data) return;
    const next = query.data.links.map(toEditorLink);
    const nextSocials = query.data.socials.map(toEditorSocial);
    const nextSettings = toPageDraft(query.data.settings);
    setItems(next);
    setBaseline(next);
    setSocialItems(nextSocials);
    setSocialBaseline(nextSocials);
    setSettings(nextSettings);
    setSettingsBaseline(nextSettings);
    setSelectedId((current) => current ?? next[0]?.client_id ?? null);
    setSelectedSocialId(
      (current) => current ?? nextSocials[0]?.client_id ?? null,
    );
    setBannerFile(null);
    setBannerAction("keep");
    setBannerPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return query.data.settings.banner_image_path
        ? resolveImageUrl(query.data.settings.banner_image_path)
        : null;
    });
  }, [query.data]);

  useEffect(
    () => () => {
      if (bannerPreview?.startsWith("blob:"))
        URL.revokeObjectURL(bannerPreview);
    },
    [bannerPreview],
  );

  const dirty =
    JSON.stringify(items) !== JSON.stringify(baseline) ||
    JSON.stringify(socialItems) !== JSON.stringify(socialBaseline) ||
    JSON.stringify(settings) !== JSON.stringify(settingsBaseline) ||
    bannerAction !== "keep";
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
      if (!settings || !query.data)
        throw new Error("Page settings are unavailable");
      const payload = {
        expected_items: baseline.flatMap((item) =>
          item.id && item.updated_at
            ? [{ id: item.id, updated_at: item.updated_at }]
            : [],
        ),
        items,
        expected_social_items: socialBaseline.flatMap((item) =>
          item.id && item.updated_at
            ? [{ id: item.id, updated_at: item.updated_at }]
            : [],
        ),
        social_items: socialItems,
        expected_settings_updated_at: query.data.settings.updated_at,
        settings,
        banner_action: bannerAction,
      };
      const checked = linksEditorSaveSchema.safeParse(payload);
      if (!checked.success)
        throw new Error(
          checked.error.issues[0]?.message ?? "Invalid links page",
        );
      const formData = new FormData();
      formData.set("snapshot", JSON.stringify(checked.data));
      if (bannerAction === "replace" && bannerFile) {
        const compressed = await imageCompression(bannerFile, {
          maxSizeMB: 4.5,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
        });
        formData.set("banner", compressed, compressed.name);
      }
      return apiFetch<AdminLinksSnapshot>("/api/links", {
        method: "PUT",
        body: formData,
      });
    },
    onSuccess: (snapshot) => {
      queryClient.setQueryData(["links"], snapshot);
      setMessage("Links page saved and public cache refreshed.");
    },
  });

  const chooseBanner = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !(
        ["image/jpeg", "image/png", "image/webp", "image/avif"] as string[]
      ).includes(file.type)
    ) {
      setMessage("Choose a JPEG, PNG, WebP, or AVIF image.");
      return;
    }
    if (bannerPreview?.startsWith("blob:")) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setBannerAction("replace");
    setMessage("New banner ready. Save to publish it.");
  };
  const discard = () => {
    if (!query.data) return;
    if (bannerPreview?.startsWith("blob:")) URL.revokeObjectURL(bannerPreview);
    setItems(baseline);
    setSocialItems(socialBaseline);
    setSettings(settingsBaseline);
    setBannerFile(null);
    setBannerAction("keep");
    setBannerPreview(
      query.data.settings.banner_image_path
        ? resolveImageUrl(query.data.settings.banner_image_path)
        : null,
    );
    setMessage("Draft discarded.");
  };

  const selectedIndex = items.findIndex(
    (item) => item.client_id === selectedId,
  );
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;
  const selectedSocialIndex = socialItems.findIndex(
    (item) => item.client_id === selectedSocialId,
  );
  const selectedSocial =
    selectedSocialIndex >= 0 ? socialItems[selectedSocialIndex] : null;
  const stats = useMemo(
    () => new Map(query.data?.stats.map((stat) => [stat.link_id, stat])),
    [query.data?.stats],
  );
  const socialStats = useMemo(
    () =>
      new Map(
        query.data?.socialStats.map((stat) => [stat.social_link_id, stat]),
      ),
    [query.data?.socialStats],
  );
  const previewLinks = items.map((item, index) =>
    resolveDraft(item, locale, index),
  );
  const previewSocials = socialItems.map((item, index) =>
    resolveSocialDraft(item, locale, index),
  );
  const openInspector = (id: string) => {
    setSelectedId(id);
    setInspectorMode("link");
    if (isDesktop === false) setMobileInspector(true);
  };
  const updateSelected = (next: EditorLink) =>
    setItems((current) =>
      current.map((item) => (item.client_id === next.client_id ? next : item)),
    );
  const updateSelectedSocial = (next: EditorSocial) =>
    setSocialItems((current) =>
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
  const moveSelectedSocial = (direction: -1 | 1) => {
    if (!selectedSocial) return;
    const target = selectedSocialIndex + direction;
    if (target < 0 || target >= socialItems.length) return;
    const next = [...socialItems];
    [next[selectedSocialIndex], next[target]] = [
      next[target],
      next[selectedSocialIndex],
    ];
    setSocialItems(next);
    setMessage(
      `${selectedSocial.label_en ?? selectedSocial.label_fr ?? "Social link"} moved to position ${target + 1}.`,
    );
  };

  if (query.isError)
    return (
      <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-danger">
        {(query.error as Error).message}
      </p>
    );
  if (query.isLoading || !settings)
    return <p className="text-[14px] text-fg/55">Loading editor…</p>;

  const linkInspector = selected ? (
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
  const socialInspector = (
    <SocialInspector
      items={socialItems}
      selectedId={selectedSocialId}
      stat={selectedSocial?.id ? socialStats.get(selectedSocial.id) : undefined}
      onSelect={setSelectedSocialId}
      onReorder={(next) => {
        setSocialItems(next);
        setMessage("Social order changed. Save to publish it.");
      }}
      onChange={updateSelectedSocial}
      onMove={moveSelectedSocial}
      onDelete={() => {
        if (selectedSocial) setDeletingSocial(selectedSocial);
      }}
    />
  );
  const pageInspector = (
    <PageInspector
      settings={settings}
      bannerUrl={bannerPreview}
      onChange={setSettings}
      onChooseBanner={chooseBanner}
      onRemoveBanner={() => {
        if (bannerPreview?.startsWith("blob:"))
          URL.revokeObjectURL(bannerPreview);
        setBannerPreview(null);
        setBannerFile(null);
        setBannerAction("remove");
        setMessage("Banner removed from the draft. Save to publish.");
      }}
    />
  );
  const inspector =
    inspectorMode === "page"
      ? pageInspector
      : inspectorMode === "social"
        ? socialInspector
        : linkInspector;
  const tagline =
    locale === "fr"
      ? settings.tagline_fr || settings.tagline_en || defaultCopy.fr
      : settings.tagline_en || settings.tagline_fr || defaultCopy.en;

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
            onClick={discard}
            disabled={!dirty}
            className="min-h-11 flex-1"
          >
            Discard
          </PillButton>
          <PillButton
            size="sm"
            variant="ghost"
            onClick={() => {
              const next = makeSocialDraft();
              setSocialItems((current) => [...current, next]);
              setSelectedSocialId(next.client_id);
              setInspectorMode("social");
              if (isDesktop === false) setMobileInspector(true);
            }}
            className="min-h-11 flex-1"
          >
            + Add social
          </PillButton>
          <PillButton
            size="sm"
            variant="ghost"
            onClick={() => {
              const next = makeDraft();
              setItems((current) => [...current, next]);
              setSelectedId(next.client_id);
              setInspectorMode("link");
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
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-full border border-danger/30 px-3 py-1.5 text-[11px]"
                onClick={() => {
                  save.reset();
                  void query.refetch();
                }}
              >
                Reload server version
              </button>
              <button
                type="button"
                className="rounded-full border border-danger/30 px-3 py-1.5 text-[11px]"
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="tag-mono">LIVE MOBILE PREVIEW</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewKey((key) => key + 1)}
                className="min-h-9 rounded-full border border-line bg-ink px-3 text-[11px]"
              >
                Replay intro
              </button>
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
          </div>
          <div
            className={`${publicFontVariables} mx-auto max-h-[760px] max-w-[420px] overflow-y-auto rounded-[32px] border border-line bg-ink shadow-xl`}
          >
            <LinksPageContent
              key={previewKey}
              links={previewLinks}
              socials={previewSocials}
              locale={locale}
              description={tagline}
              emptyLabel="No links yet."
              linksLabel="Editor preview"
              socialsLabel="Social links preview"
              opensNewTabLabel="opens in a new tab"
              backHomeLabel={
                locale === "fr" ? "Retour à l’accueil" : "Back home"
              }
              bannerImageUrl={bannerPreview}
              bannerFocalX={settings.banner_focal_x}
              bannerFocalY={settings.banner_focal_y}
              mode="editor"
              animateIntro
              selectedId={selectedId}
              onSelect={openInspector}
              selectedSocialId={selectedSocialId}
              draftSocialIds={socialItems
                .filter((item) => !item.published)
                .map((item) => item.client_id)}
              onSelectSocial={(id) => {
                setSelectedSocialId(id);
                setInspectorMode("social");
                if (isDesktop === false) setMobileInspector(true);
              }}
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
          <button
            type="button"
            onClick={() => {
              setInspectorMode("page");
              if (isDesktop === false) setMobileInspector(true);
            }}
            className="mt-3 min-h-11 w-full rounded-full border border-line bg-ink text-[12px] lg:hidden"
          >
            Edit page appearance
          </button>
        </div>
        <aside className="sticky top-8 hidden max-h-[calc(100vh-4rem)] rounded-card border border-line bg-panel p-5 lg:block">
          <div className="mb-5 grid grid-cols-3 rounded-full border border-line bg-ink p-1">
            <button
              type="button"
              onClick={() => setInspectorMode("page")}
              className={`rounded-full px-3 py-2 text-[12px] ${inspectorMode === "page" ? "bg-inverse text-on-inverse" : "text-fg/50"}`}
            >
              Page
            </button>
            <button
              type="button"
              onClick={() => setInspectorMode("social")}
              className={`rounded-full px-3 py-2 text-[12px] ${inspectorMode === "social" ? "bg-inverse text-on-inverse" : "text-fg/50"}`}
            >
              Socials
            </button>
            <button
              type="button"
              onClick={() => setInspectorMode("link")}
              className={`rounded-full px-3 py-2 text-[12px] ${inspectorMode === "link" ? "bg-inverse text-on-inverse" : "text-fg/50"}`}
            >
              Selected link
            </button>
          </div>
          {inspector}
        </aside>
      </div>

      <Sheet
        open={mobileInspector}
        onClose={() => setMobileInspector(false)}
        title={
          inspectorMode === "page"
            ? "Page appearance"
            : inspectorMode === "social"
              ? "Social links"
              : "Link properties"
        }
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
      <ConfirmDialog
        open={!!deletingSocial}
        title="Delete this social link?"
        message="Saving will permanently delete this social link and all of its click statistics."
        onClose={() => setDeletingSocial(null)}
        onConfirm={() => {
          if (!deletingSocial) return;
          setSocialItems((current) =>
            current.filter(
              (item) => item.client_id !== deletingSocial.client_id,
            ),
          );
          setSelectedSocialId(null);
          setDeletingSocial(null);
          setMobileInspector(false);
        }}
      />
    </div>
  );
}
