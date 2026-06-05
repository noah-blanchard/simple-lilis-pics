import "server-only";

import type { TranslateInput } from "@/lib/api/schemas";
import { buildMessages } from "./prompts";

/** Thrown when the OpenRouter API key is not configured. The route handler maps
 *  this to a CONFIG_ERROR (500) instead of a generic upstream failure. */
export class TranslateConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranslateConfigError";
  }
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
const TIMEOUT_MS = 20_000;

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

/** Strip a single pair of surrounding quotes the model may have added. */
function unquote(text: string): string {
  const trimmed = text.trim();
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("«") && trimmed.endsWith("»"));
  return quoted ? trimmed.slice(1, -1).trim() : trimmed;
}

/** Translate `text` between FR and EN via OpenRouter. Server-only.
 *  Throws TranslateConfigError if unconfigured, or Error on upstream failure. */
export async function translateText(input: TranslateInput): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new TranslateConfigError("Translation service is not configured");
  }
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: buildMessages(input),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Translation timed out");
    }
    throw new Error("Could not reach the translation service");
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`Translation service error (${res.status})`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content || !content.trim()) {
    throw new Error("Translation service returned an empty result");
  }

  return unquote(content);
}
