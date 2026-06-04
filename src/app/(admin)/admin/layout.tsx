import type { ReactNode } from "react";
import { QueryProvider } from "@/components/admin/QueryProvider";
import { SignOutButton } from "@/components/admin/SignOutButton";

/** Admin shell — header + sign-out, wrapped in the TanStack Query provider.
 *  Sits inside the (admin) root layout which supplies <html>/<body>. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen">
        <header className="flex items-center justify-between border-line border-b px-6 py-5 md:px-10">
          <a
            href="/admin"
            className="font-semibold text-[20px] italic tracking-tight"
          >
            <span>Lilis</span>
            <span className="text-accent">.</span>
            <span>Pics</span>
            <span className="ml-2 text-[14px] text-fg/45 not-italic">
              admin
            </span>
          </a>
          <SignOutButton />
        </header>

        <main className="px-6 py-8 md:px-10">{children}</main>
      </div>
    </QueryProvider>
  );
}
