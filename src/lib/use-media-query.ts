"use client";

import { useEffect, useState } from "react";

/** Tracks a media query, returning `null` until mounted so the caller can tell
 *  "not measured yet" from a real answer. Server render and first paint agree
 *  on `null`, which keeps hydration stable. */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Matches Tailwind's `lg` breakpoint — the point where the admin swaps its
 *  bottom sheets for centred dialogs and its tab bar for the sidebar. */
export function useIsDesktop(): boolean | null {
  return useMediaQuery("(min-width: 1024px)");
}
