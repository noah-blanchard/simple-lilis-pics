// Shared key for the persisted theme choice.
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

// Builds the anti-flash script string injected (synchronously, before paint) by
// `InlineScript` in the root layouts. It resolves the initial theme from the
// persisted choice, defaulting to the site's dark-first identity when none is
// stored, and reflects it onto <html> so `ThemeProvider` can reconcile from the
// DOM class on mount. Kept as a plain string so it can run before hydration.
export function themeInitScript(): string {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var d=s?s==="dark":true;var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(_){}})();`;
}
