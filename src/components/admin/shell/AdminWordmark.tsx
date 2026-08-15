import Link from "next/link";
import { ADMIN_HOME } from "@/lib/admin/sections";

/** The "Lilis.Pics admin" lockup, linking back to the hub. */
export function AdminWordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href={ADMIN_HOME}
      className={`font-semibold text-[20px] italic tracking-tight ${className}`}
    >
      <span>Lilis</span>
      <span className="text-accent">.</span>
      <span>Pics</span>
      <span className="ml-2 text-[14px] text-fg/45 not-italic">admin</span>
    </Link>
  );
}
