// Shared key for the persisted theme choice.
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

// Inline script injected (blocking) into <head> before paint. It resolves the
// initial theme — explicit choice in localStorage, else the OS preference — and
// applies the `.dark` class + `color-scheme` so the first paint is correct and
// there is no flash. Kept tiny and dependency-free on purpose.
export const themeScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(_){}})();`;
