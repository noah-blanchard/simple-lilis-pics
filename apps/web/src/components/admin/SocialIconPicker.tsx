"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { SocialIconKey } from "@/lib/links/constants";
import {
  SOCIAL_ICON_REGISTRY,
  type SocialIconDefinition,
} from "@/lib/links/social-icons";

interface SocialIconPickerProps {
  value: SocialIconKey;
  suggestionText: string;
  onChange: (key: SocialIconKey) => void;
}

const DEFAULT_SUGGESTIONS: SocialIconKey[] = [
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function boundedDistance(left: string, right: string, limit = 2): number {
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution =
        previous[rightIndex - 1] +
        (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      const value = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        substitution,
      );
      current.push(value);
      rowMinimum = Math.min(rowMinimum, value);
    }
    if (rowMinimum > limit) return limit + 1;
    previous = current;
  }

  return previous[right.length];
}

function scoreTerm(query: string, term: string): number {
  if (!term) return 0;
  if (term === query) return 100;
  if (term.startsWith(query)) return 80;
  if (term.split(" ").some((token) => token.startsWith(query))) return 68;
  if (term.includes(query)) return 52;
  if (query.length >= 3) {
    const distance = boundedDistance(query, term);
    if (distance <= 2) return 34 - distance * 6;
  }
  return 0;
}

function scoreIcon(query: string, icon: SocialIconDefinition): number {
  const terms = [icon.label, icon.key, ...icon.aliases].map(normalize);
  return Math.max(...terms.map((term) => scoreTerm(query, term)));
}

function searchIcons(query: string): SocialIconDefinition[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  return SOCIAL_ICON_REGISTRY.map((icon) => ({
    icon,
    score: scoreIcon(normalized, icon),
  }))
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.icon.label.localeCompare(right.icon.label),
    )
    .map(({ icon }) => icon);
}

function suggestIcons(context: string): SocialIconDefinition[] {
  const queries = normalize(context)
    .split(" ")
    .filter((token) => token.length >= 2);
  return SOCIAL_ICON_REGISTRY.map((icon) => ({
    icon,
    score: Math.max(0, ...queries.map((query) => scoreIcon(query, icon))),
  }))
    .filter(({ score }) => score >= 52)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.icon.label.localeCompare(right.icon.label),
    )
    .map(({ icon }) => icon);
}

export function SocialIconPicker({
  value,
  suggestionText,
  onChange,
}: SocialIconPickerProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = SOCIAL_ICON_REGISTRY.find((icon) => icon.key === value);
  const results = useMemo(() => searchIcons(query).slice(0, 8), [query]);
  const suggestions = useMemo(() => {
    const contextual = suggestIcons(suggestionText).map((icon) => icon.key);
    return [...contextual, ...DEFAULT_SUGGESTIONS]
      .filter(
        (key, index, keys) => key !== value && keys.indexOf(key) === index,
      )
      .slice(0, 4)
      .map((key) => SOCIAL_ICON_REGISTRY.find((icon) => icon.key === key))
      .filter((icon): icon is SocialIconDefinition => Boolean(icon));
  }, [suggestionText, value]);
  const choose = (key: SocialIconKey) => {
    onChange(key);
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  return (
    <fieldset>
      <legend className="block font-medium text-[12px] text-fg/60">
        Social icon
      </legend>

      {selected && (
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl border border-accent bg-accent-soft px-3 text-left text-accent"
        >
          <selected.Icon aria-hidden className="h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] text-fg/45 uppercase">
              Selected icon
            </span>
            <span className="block truncate text-[12px] text-fg">
              {selected.label}
            </span>
          </span>
          <span className="text-[10px] text-fg/45">Change</span>
        </button>
      )}

      <span className="mt-3 block text-[10px] text-fg/45 uppercase">
        Suggested
      </span>
      <div className="mt-1.5 grid grid-cols-4 gap-2">
        {suggestions.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => choose(key)}
            aria-label={`Use ${label} icon`}
            className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-line px-1 text-[9px] hover:border-accent hover:bg-accent-soft"
          >
            <Icon aria-hidden className="h-5 w-5" />
            <span className="max-w-full truncate">{label}</span>
          </button>
        ))}
      </div>

      <label
        className="mt-3 block text-[10px] text-fg/45 uppercase"
        htmlFor={`${listId}-input`}
      >
        Find another icon
      </label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={(event) => {
          if (!query || results.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % results.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex(
              (index) => (index - 1 + results.length) % results.length,
            );
          } else if (event.key === "Enter") {
            event.preventDefault();
            const result = results[activeIndex];
            if (result) choose(result.key);
          } else if (event.key === "Escape") {
            setQuery("");
            setActiveIndex(0);
          }
        }}
        role="combobox"
        aria-expanded={Boolean(query)}
        aria-controls={listId}
        aria-activedescendant={
          query && results[activeIndex]
            ? `${listId}-${results[activeIndex].key}`
            : undefined
        }
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Try Instagram, Twitter, photo…"
        className="mt-1.5 w-full rounded-xl border border-line-strong bg-ink px-3 py-2.5 text-[14px] outline-none focus:border-accent"
      />

      {query && (
        <div
          id={listId}
          role="listbox"
          aria-label="Matching social icons"
          className="mt-2 grid grid-cols-4 gap-2"
        >
          {results.map(({ key, label, Icon }, index) => (
            <button
              key={key}
              id={`${listId}-${key}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(key)}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 text-[9px] ${index === activeIndex ? "border-accent bg-accent-soft text-accent" : "border-line"}`}
            >
              <Icon aria-hidden className="h-5 w-5" />
              <span className="max-w-full truncate">{label}</span>
            </button>
          ))}
        </div>
      )}
      {query && results.length === 0 && (
        <p className="mt-2 text-[11px] text-fg/45">No matching social icon.</p>
      )}
    </fieldset>
  );
}
