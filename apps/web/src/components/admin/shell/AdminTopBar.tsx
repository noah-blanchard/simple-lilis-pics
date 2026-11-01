"use client";

import Link from "next/link";
import { IconChevronLeft } from "@/components/Icons";
import { ADMIN_HOME } from "@/lib/admin/sections";
import { AdminWordmark } from "./AdminWordmark";

/** Mobile header: the wordmark on the hub, a back arrow + section title
 *  elsewhere. Hidden from `lg` up, where the sidebar carries identity. */
export function AdminTopBar({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-[var(--z-nav)] flex min-h-14 items-center gap-1 border-line border-b bg-ink/95 px-2 backdrop-blur lg:hidden">
      {title ? (
        <>
          <Link
            href={ADMIN_HOME}
            aria-label="Back to dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-full text-fg/60"
          >
            <IconChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-semibold text-[17px] tracking-tight">{title}</h1>
        </>
      ) : (
        <AdminWordmark className="px-2" />
      )}
    </header>
  );
}
