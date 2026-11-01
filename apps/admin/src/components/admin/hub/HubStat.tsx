"use client";

/** Shared presentation for every hub card stat, so the figures line up across
 *  cards no matter which query feeds them. */
export function HubStat({
  value,
  note,
  attention = false,
  loading = false,
}: {
  value: string;
  note?: string;
  /** Draws the accent dot — something in this section is waiting on you. */
  attention?: boolean;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex animate-pulse flex-col gap-1.5">
        <div className="h-[18px] w-24 rounded bg-fg/10" />
        <div className="h-[12px] w-16 rounded bg-fg/5" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-2 font-semibold text-[16px] tracking-tight">
        {value}
        {attention && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        )}
      </span>
      {note && <span className="text-[12px] text-fg/45">{note}</span>}
    </div>
  );
}
