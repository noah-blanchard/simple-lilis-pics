interface MarqueeProps {
  items: string[];
}

// Infinite CSS marquee (no JS). Items are repeated to fill the track width.
export const Marquee = ({ items }: MarqueeProps) => {
  const all = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-line/60 border-y py-6">
      <div className="marquee-track">
        {all.map((item, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: the marquee repeats a fixed, static list, so the index is the only stable discriminator.
            key={`${item}-${i}`}
            className="display flex items-center gap-12 text-3xl text-fg/15 uppercase tracking-tight md:text-5xl"
          >
            <span>{item}</span>
            <span className="h-2 w-2 rounded-full bg-accent/60" />
          </span>
        ))}
      </div>
    </div>
  );
};
