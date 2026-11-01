"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { findActiveSection } from "@/lib/admin/sections";
import { AdminBottomNav } from "./AdminBottomNav";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

/** Admin chrome. Both navigations are always mounted and switched purely by
 *  breakpoint, so there is no media-query flash on hydration. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = findActiveSection(pathname);

  return (
    <div className="lg:flex">
      <AdminSidebar activeKey={active?.key} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminTopBar title={active?.title} />
        {/* pb clears the fixed tab bar; from lg up there is no tab bar. */}
        <main className="min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-12">
          {children}
        </main>
      </div>

      <AdminBottomNav activeKey={active?.key} isHub={!active} />
    </div>
  );
}
