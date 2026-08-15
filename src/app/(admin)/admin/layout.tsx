import type { ReactNode } from "react";
import { QueryProvider } from "@/components/admin/QueryProvider";
import { AdminShell } from "@/components/admin/shell/AdminShell";

/** Admin shell — navigation comes from the section registry in
 *  `lib/admin/sections`. Sits inside the (admin) root layout which supplies
 *  <html>/<body>. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AdminShell>{children}</AdminShell>
    </QueryProvider>
  );
}
