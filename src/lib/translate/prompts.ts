/** Prompt construction for the AI translation feature. Kept separate from the
 *  network layer so the wording can evolve without touching the OpenRouter
 *  client. Pure functions, no side effects. */

import type { TranslateInput } from "@/lib/api/schemas";

/** Discriminated per role so the array is assignable to the OpenRouter SDK's
 *  `ChatMessages[]` union without coupling this module to the SDK types. */
export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string };

const LANGUAGE_NAMES: Record<TranslateInput["from"], string> = {
  en: "English",
  fr: "French",
};

/** A strict system prompt: the model must return ONLY the translation so the
 *  result can be dropped straight into the form field. */
function systemPrompt(from: string, to: string, kind: TranslateInput["kind"]) {
  const base =
    `You are a professional ${from}-to-${to} translator for a photography ` +
    `portfolio. Translate the user's text from ${from} to ${to}. ` +
    `Return ONLY the translation — no quotes, no explanations, no notes, ` +
    `no surrounding markup. Preserve the original tone and register.`;

  const kindHint =
    kind === "title"
      ? " The text is a short project title; keep it concise and natural."
      : kind === "tag"
        ? " The text is a short taxonomy tag/category label shown in a UI " +
          "chip; keep it to 1-3 words, title case, no punctuation."
        : " The text is a project description; keep paragraph breaks and meaning intact.";

  return base + kindHint;
}

/** Build the chat messages array sent to the OpenRouter chat-completions API. */
export function buildMessages({
  text,
  from,
  to,
  kind,
}: TranslateInput): ChatMessage[] {
  const fromName = LANGUAGE_NAMES[from];
  const toName = LANGUAGE_NAMES[to];
  return [
    { role: "system", content: systemPrompt(fromName, toName, kind) },
    { role: "user", content: text },
  ];
}
