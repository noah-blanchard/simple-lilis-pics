import type { ReactNode } from "react";

// The `<html>` and `<body>` tags live in `app/[locale]/layout.tsx` so they can
// receive the active locale. This root layout only forwards children.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
