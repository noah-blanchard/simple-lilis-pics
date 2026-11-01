"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { TranslateInput } from "@/lib/api/schemas";

/** React Query mutation that proxies a translation request through
 *  POST /api/translate and returns the translated string. UI-agnostic and
 *  reusable; the caller decides what to do with the result. */
export function useTranslate() {
  return useMutation({
    mutationFn: (payload: TranslateInput) =>
      apiFetch<{ translation: string }>("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}
