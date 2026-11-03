"use client";

import type { Locale } from "@lili/core/i18n/routing";
import {
  type MotionStyle,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import { type DayPart, dayPartOf, formatTime } from "@/lib/format";
import { Clock } from "./Clock";
import { DuskBand } from "./DuskBand";
import { Moment, type MomentView } from "./Moment";
import { Tone } from "./Tone";

// Day and night values of the four tokens this section animates (D17). They
// mirror globals.css; this section is the only place colours are interpolated.
const DAY = { bg: "#f4f4f4", fg: "#171717", muted: "#5c5c5c", line: "#dbdbdb" };
const NIGHT = {
  bg: "#141414",
  fg: "#ededed",
  muted: "#a0a0a0",
  line: "#303030",
};

export interface TimedMoment extends MomentView {
  minutes: number;
  tone: "day" | "dusk" | "night";
}

interface Props {
  moments: TimedMoment[];
  locale: Locale;
  partLabels: Record<DayPart, string>;
  header: ReactNode;
  intro: string;
}

const Intro = ({ header, intro }: { header: ReactNode; intro: string }) => (
  <>
    {header}
    <p className="max-w-[26em] text-muted">{intro}</p>
  </>
);

export function HourByHourClient({
  moments,
  locale,
  partLabels,
  header,
  intro,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // One stop per moment, evenly spaced: progress i/(n-1) shows moment i's time.
  const last = moments.length - 1;
  const stops = moments.map((_, i) => i / last);
  const minutes = useTransform(
    scrollYProgress,
    stops,
    moments.map((m) => m.minutes),
  );

  const initial = moments[0].minutes;
  const [clock, setClock] = useState(() => ({
    time: formatTime(initial, locale),
    part: dayPartOf(initial),
  }));
  useMotionValueEvent(minutes, "change", (v) => {
    const rounded = Math.round(v / 5) * 5;
    const time = formatTime(rounded, locale);
    setClock((c) => (c.time === time ? c : { time, part: dayPartOf(rounded) }));
  });

  // Dusk runs across the golden-hour moment: half a step before to half after.
  const duskIndex = moments.findIndex((m) => m.tone === "dusk");
  const dusk = [(duskIndex - 0.5) / last, (duskIndex + 0.5) / last];
  const bg = useTransform(scrollYProgress, dusk, [DAY.bg, NIGHT.bg]);
  const fg = useTransform(scrollYProgress, dusk, [DAY.fg, NIGHT.fg]);
  const muted = useTransform(scrollYProgress, dusk, [DAY.muted, NIGHT.muted]);
  const line = useTransform(scrollYProgress, dusk, [DAY.line, NIGHT.line]);

  if (reduce) {
    const dayMoments = moments.filter((m) => m.tone !== "night");
    const nightMoments = moments.filter((m) => m.tone === "night");
    const list = (items: TimedMoment[]) => (
      <ol className="mx-auto flex max-w-xl flex-col gap-16">
        {items.map((m) => (
          <li key={m.key}>
            <Moment moment={m} />
          </li>
        ))}
      </ol>
    );
    return (
      <section id="the-day" aria-labelledby="the-day-title">
        <Tone tone="day" className="section-y">
          <div className="container-site flex flex-col gap-16">
            <div className="flex flex-col gap-6">
              <Intro header={header} intro={intro} />
            </div>
            {list(dayMoments)}
          </div>
        </Tone>
        <DuskBand />
        <Tone tone="night" className="section-y">
          <div className="container-site">{list(nightMoments)}</div>
        </Tone>
      </section>
    );
  }

  // CSS variables accept motion values in `style`; the cast keeps the types quiet.
  const style = {
    "--bg": bg,
    "--fg": fg,
    "--muted": muted,
    "--line": line,
    backgroundColor: bg,
    color: fg,
  } as unknown as MotionStyle;

  return (
    <motion.section
      ref={ref}
      id="the-day"
      aria-labelledby="the-day-title"
      style={style}
      className="relative"
    >
      <div className="container-site grid gap-x-10 lg:grid-cols-12">
        {/* Header and intro once; on desktop the column sticks and carries the clock. */}
        <div className="pt-16 lg:col-span-5 lg:row-start-1 lg:pt-0">
          <div className="flex flex-col gap-6 lg:sticky lg:top-0 lg:h-svh lg:justify-center lg:gap-10">
            <Intro header={header} intro={intro} />
            <div className="hidden lg:block">
              <Clock time={clock.time} part={partLabels[clock.part]} />
            </div>
          </div>
        </div>
        {/* Phones: the clock is pinned as a slim bar, clear of the menu pill. */}
        <div className="-mx-6 sticky top-0 z-[var(--z-base)] mt-10 border-line border-b bg-[var(--bg)] px-6 py-3 pr-32 lg:hidden">
          <Clock compact time={clock.time} part={partLabels[clock.part]} />
        </div>
        <ol className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
          {moments.map((m) => (
            <li
              key={m.key}
              className="flex min-h-[85svh] items-center py-16 lg:py-0"
            >
              <Moment moment={m} />
            </li>
          ))}
        </ol>
      </div>
    </motion.section>
  );
}
