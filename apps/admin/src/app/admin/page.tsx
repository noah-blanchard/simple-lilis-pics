import Link from "next/link";
import { ADMIN_SECTIONS } from "@/lib/admin/sections";

/** The dashboard hub. Every card comes from the section registry, so a new
 *  admin feature appears here the moment it is registered. */
export default function AdminHubPage() {
  return (
    <div>
      <div className="mb-8 hidden lg:block">
        <h1 className="font-semibold text-[26px] tracking-tight">Dashboard</h1>
        <p className="mt-1 text-[14px] text-fg/55">
          Everything you can manage on the site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ADMIN_SECTIONS.map(({ key, href, label, description, Icon, Stat }) => (
          <Link
            key={key}
            href={href}
            className="group flex min-h-36 flex-col rounded-card bg-panel p-5 transition-colors hover:bg-panel2"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-semibold text-[16px] tracking-tight">
                {label}
              </span>
              <span
                aria-hidden
                className="ml-auto text-[18px] text-fg/25 transition-colors group-hover:text-accent"
              >
                →
              </span>
            </div>

            <p className="mt-3 text-[13px] text-fg/50">{description}</p>

            {Stat && (
              <div className="mt-auto pt-4">
                <Stat />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
