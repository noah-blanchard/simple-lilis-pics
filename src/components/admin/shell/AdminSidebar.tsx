"use client";

import Link from "next/link";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { ADMIN_SECTIONS } from "@/lib/admin/sections";
import { AdminWordmark } from "./AdminWordmark";

/** Desktop navigation rail. Hidden below `lg`, where AdminBottomNav takes over. */
export function AdminSidebar({ activeKey }: { activeKey?: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-line border-r px-4 py-6 lg:flex">
      <AdminWordmark className="px-3" />

      <nav className="mt-8 flex flex-col gap-1">
        {ADMIN_SECTIONS.map(({ key, href, label, Icon }) => {
          const active = key === activeKey;
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors ${
                active
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-fg/60 hover:bg-panel hover:text-fg"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-start gap-3 px-3">
        <Link
          href="/"
          className="text-[13px] text-fg/50 transition-colors hover:text-fg"
        >
          <span aria-hidden>← </span>Back to site
        </Link>
        <SignOutButton />
      </div>
    </aside>
  );
}
