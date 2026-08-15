"use client";

import { useMutation } from "@tanstack/react-query";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { PillButton } from "@/components/PillButton";
import type { Locale } from "@/i18n/routing";
import { apiFetch } from "@/lib/api/client";

interface RatingTokenCreated {
  token: string;
  url: string;
  expires_at: string;
}

interface RatingQrDialogProps {
  /** Mint a code as soon as the dialog opens — Lili is standing in front of
   *  someone, one less tap matters. */
  open: boolean;
}

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
];

/** "23h 41m" / "48m" / "expired" — recomputed every 30s. */
function formatRemaining(expiresAt: string, now: number): string {
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return "expired";
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

/**
 * Generates a single-use rating link and renders it as a QR code for Lili to
 * hold up. The QR sits on pure white with a wide quiet zone: the site canvas is
 * #f4f4f4, and a tinted or tight quiet zone measurably hurts scan reliability
 * on a phone screen at an angle.
 */
export function RatingQrDialog({ open }: RatingQrDialogProps) {
  const [locale, setLocale] = useState<Locale>("en");
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const mutation = useMutation({
    mutationFn: (next: Locale) =>
      apiFetch<RatingTokenCreated>("/api/rating-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      }),
    onSuccess: async (data) => {
      setQr(
        await QRCode.toDataURL(data.url, {
          margin: 3,
          width: 640,
          errorCorrectionLevel: "M",
          color: { dark: "#171717", light: "#ffffff" },
        }),
      );
    },
  });

  const { mutate } = mutation;
  const generate = useCallback(
    (next: Locale) => {
      setQr(null);
      setCopied(false);
      mutate(next);
    },
    [mutate],
  );

  // Mint one on open, and a fresh one whenever the language changes — a code
  // in the wrong language is useless, not worth keeping around.
  useEffect(() => {
    if (open) generate(locale);
  }, [open, locale, generate]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [open]);

  const created = mutation.data;

  const copyUrl = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the URL is shown in full below the QR.
    }
  };

  const share = async () => {
    if (!created || !navigator.share) return;
    try {
      await navigator.share({ url: created.url });
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  };

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      <fieldset className="flex gap-2">
        <legend className="sr-only">QR language</legend>
        {LOCALES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            aria-pressed={locale === option.value}
            className={`cursor-pointer rounded-full px-4 py-2 text-[13px] ${
              locale === option.value
                ? "bg-inverse text-on-inverse"
                : "border border-line-strong text-fg/60"
            }`}
          >
            {option.label}
          </button>
        ))}
      </fieldset>

      <div className="mt-6 flex aspect-square w-full max-w-[280px] items-center justify-center rounded-2xl bg-white p-3">
        {qr ? (
          // The QR is a data: URI generated in the browser, so there is no
          // build-time source for next/image to optimize.
          // biome-ignore lint/performance/noImgElement: runtime-generated data URI
          <img
            src={qr}
            alt={`QR code linking to ${created?.url ?? "the rating page"}`}
            className="h-full w-full"
          />
        ) : (
          <span className="text-[13px] text-neutral-400">
            {mutation.isError ? "Could not generate" : "Generating…"}
          </span>
        )}
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-4 text-[13px] text-danger">
          {(mutation.error as Error).message}
        </p>
      )}

      {created && (
        <>
          <p className="mt-5 break-all text-center font-mono text-[12px] text-fg/50">
            {created.url}
          </p>
          <p className="mt-2 text-[13px] text-fg/60">
            Single use · expires in {formatRemaining(created.expires_at, now)}
          </p>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pb-2">
        <PillButton
          variant="ghost"
          size="sm"
          onClick={copyUrl}
          disabled={!created}
        >
          {copied ? "Copied" : "Copy link"}
        </PillButton>
        <PillButton
          variant="ghost"
          size="sm"
          onClick={share}
          disabled={!created}
        >
          Share
        </PillButton>
        <PillButton
          variant="light"
          size="sm"
          onClick={() => generate(locale)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Generating…" : "New code"}
        </PillButton>
      </div>
    </div>
  );
}
