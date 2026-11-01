"use client";

import type { ResolvedProject } from "@lili/core/types/db";
import { BentoImageGrid } from "@/components/BentoImageGrid";
import { FEATURED_BENTO_BREAKPOINTS } from "@/lib/bento";

interface FeaturedBentoGridProps {
  items: ResolvedProject[];
}

/** Gap between featured tiles, in px. */
const GAP = 24;

/** Home page featured section — exact-aspect bento with per-project sizes set in
 *  the admin editor (`featured_col_span`). */
export const FeaturedBentoGrid = ({ items }: FeaturedBentoGridProps) => (
  <BentoImageGrid
    items={items}
    breakpoints={FEATURED_BENTO_BREAKPOINTS}
    gap={GAP}
    colSpanFor={(p) => p.featuredColSpan}
  />
);
