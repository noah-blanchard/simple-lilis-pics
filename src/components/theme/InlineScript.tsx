// Renders a synchronous inline <script> that runs during HTML parsing (before
// first paint) without tripping React 19's "script tag while rendering" warning
// or losing its DOM mutations during hydration recovery.
//
// The trick (per the Next.js "preventing flash before hydration" guide): emit a
// real, executable script on the server (`text/javascript`) but an inert one on
// the client (`text/plain`). `suppressHydrationWarning` lets the type attribute
// differ between the two without React treating it as a mismatch. The script has
// already run by the time the client sees it, so making it inert is harmless —
// and it stops React from re-rendering/re-executing it and clobbering the class
// the script set on <html>.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static string
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
    />
  );
}
