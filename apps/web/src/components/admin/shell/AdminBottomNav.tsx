"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { IconDots, IconGrid } from "@/components/Icons";
import { ADMIN_HOME, ADMIN_SECTIONS } from "@/lib/admin/sections";
import { EASE } from "@/lib/motion";

const tabClass =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors";

/** Thumb-reachable tab bar: the hub, the sections flagged `primary`, then More.
 *  Hidden from `lg` up, where AdminSidebar takes over. */
export function AdminBottomNav({
  activeKey,
  isHub,
}: {
  activeKey?: string;
  isHub: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = ADMIN_SECTIONS.filter((section) => section.primary);
  const overflow = ADMIN_SECTIONS.filter((section) => !section.primary);
  // A section hidden behind More still marks the tab as active.
  const moreActive = overflow.some((section) => section.key === activeKey);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] border-line border-t bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="flex items-stretch">
          <Link
            href={ADMIN_HOME}
            aria-current={isHub ? "page" : undefined}
            className={`${tabClass} ${isHub ? "text-accent" : "text-fg/50"}`}
          >
            <IconGrid className="h-[20px] w-[20px]" />
            Home
          </Link>

          {primary.map(({ key, href, label, Icon }) => {
            const active = key === activeKey;
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${tabClass} ${active ? "text-accent" : "text-fg/50"}`}
              >
                <Icon className="h-[20px] w-[20px]" />
                {label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            className={`${tabClass} ${moreActive ? "text-accent" : "text-fg/50"}`}
          >
            <IconDots className="h-[20px] w-[20px]" />
            More
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-[var(--z-menu)] flex flex-col justify-end lg:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setMoreOpen(false)}
              className="absolute inset-0 bg-scrim backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative rounded-t-card border-line border-t bg-panel px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong/40" />

              <div className="flex flex-col">
                {overflow.map(({ key, href, label, description, Icon }) => (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex min-h-14 items-center gap-3 rounded-xl px-3 ${
                      key === activeKey ? "text-accent" : "text-fg"
                    }`}
                  >
                    <Icon className="h-[20px] w-[20px] shrink-0" />
                    <span className="flex flex-col">
                      <span className="text-[15px]">{label}</span>
                      <span className="text-[12px] text-fg/45">
                        {description}
                      </span>
                    </span>
                  </Link>
                ))}

                {overflow.length > 0 && (
                  <div className="my-2 border-line border-t" />
                )}

                <Link
                  href="/"
                  onClick={() => setMoreOpen(false)}
                  className="flex min-h-14 items-center px-3 text-[15px] text-fg/70"
                >
                  <span aria-hidden className="mr-2">
                    ←
                  </span>
                  Back to site
                </Link>

                <div className="px-3 pt-2">
                  <SignOutButton />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
