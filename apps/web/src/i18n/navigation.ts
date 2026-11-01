import { routing } from "@lili/core/i18n/routing";
import { createNavigation } from "next-intl/navigation";

// Locale-aware navigation primitives. Use these instead of next/link and
// next/navigation so locale prefixing is handled automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
