"use client";

import { motion, useReducedMotion } from "motion/react";
import { getSocialIcon } from "@/lib/links/social-icons";
import { EASE } from "@/lib/motion";
import type { ResolvedSocialLink } from "@/types/db";

interface SocialLinksProps {
  socials: ResolvedSocialLink[];
  label: string;
  opensNewTabLabel: string;
  mode?: "public" | "editor";
  animateIntro?: boolean;
  selectedId?: string | null;
  draftIds?: string[];
  onSelect?: (id: string) => void;
}

const recentSignals = new Map<string, number>();

function recordClick(id: string) {
  const now = Date.now();
  if (now - (recentSignals.get(id) ?? 0) < 1000) return;
  recentSignals.set(id, now);

  const endpoint = `/api/links/socials/${id}/click`;
  if (navigator.sendBeacon?.(endpoint, new Blob([], { type: "text/plain" })))
    return;
  void fetch(endpoint, { method: "POST", keepalive: true }).catch(() => {});
}

export function SocialLinks({
  socials,
  label,
  opensNewTabLabel,
  mode = "public",
  animateIntro = mode === "public",
  selectedId,
  draftIds = [],
  onSelect,
}: SocialLinksProps) {
  const reduce = useReducedMotion();
  if (socials.length === 0) return null;

  return (
    <nav aria-label={label} className="mb-7">
      <motion.ul
        initial={animateIntro ? "hidden" : false}
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: reduce ? 0 : 0.58,
              staggerChildren: reduce ? 0 : 0.045,
            },
          },
        }}
        className="flex flex-wrap justify-center gap-2"
      >
        {socials.map((social) => {
          const Icon = getSocialIcon(social.iconKey);
          const newTab = !social.url.startsWith("mailto:");
          const ariaLabel = newTab
            ? `${social.label} (${opensNewTabLabel})`
            : social.label;
          const className = `group relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
            selectedId === social.id
              ? "border-accent bg-accent-soft text-accent"
              : "border-white/70 bg-white/70 text-fg hover:bg-white focus-visible:bg-white"
          }`;
          const content = (
            <>
              <Icon aria-hidden className="h-[19px] w-[19px]" />
              <span
                role="tooltip"
                className="-translate-x-1/2 pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 w-max max-w-48 rounded-lg bg-inverse px-2.5 py-1.5 text-center text-[11px] text-on-inverse opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {social.label}
              </span>
              {mode === "editor" && draftIds.includes(social.id) && (
                <span
                  aria-hidden
                  className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-fg/45"
                />
              )}
            </>
          );

          return (
            <motion.li
              key={social.id}
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 8 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: reduce ? 0.15 : 0.3, ease: EASE }}
            >
              {mode === "editor" ? (
                <button
                  type="button"
                  aria-label={social.label}
                  onClick={() => onSelect?.(social.id)}
                  className={className}
                >
                  {content}
                </button>
              ) : (
                <a
                  href={social.url}
                  target={newTab ? "_blank" : undefined}
                  rel={newTab ? "noopener noreferrer" : undefined}
                  aria-label={ariaLabel}
                  onClick={() => recordClick(social.id)}
                  className={className}
                >
                  {content}
                </a>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    </nav>
  );
}
