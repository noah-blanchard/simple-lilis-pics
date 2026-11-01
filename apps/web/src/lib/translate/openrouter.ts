import "server-only";

import { OpenRouter } from "@openrouter/sdk";
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

/** Thrown on an upstream OpenRouter/provider failure, carrying the HTTP status
 *  so the route can forward a meaningful code (e.g. 429 rate-limit). */
export class TranslateUpstreamError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "TranslateUpstreamError";
    this.status = status;
  }
}

/** Shape of the OpenRouter SDK's typed error responses (best-effort). */
interface SdkErrorShape {
  statusCode?: number;
  message?: string;
  error?: {
    message?: string;
    metadata?: { raw?: string; retry_after_seconds?: number };
  };
}

/** Turn an unknown thrown value into a clean message + HTTP status. */
function describeUpstreamError(err: unknown): TranslateUpstreamError {
  console.error("[translate] OpenRouter request failed:", err);
  const e = (err ?? {}) as SdkErrorShape;
  const status = typeof e.statusCode === "number" ? e.statusCode : 502;

  if (status === 429) {
    const retry = e.error?.metadata?.retry_after_seconds;
    const wait = retry ? ` Retry in ~${Math.ceil(retry)}s.` : "";
    return new TranslateUpstreamError(
      `Translation model is rate-limited upstream.${wait} Please try again shortly.`,
      429,
    );
  }

  const message =
    e.error?.metadata?.raw ??
    e.error?.message ??
    e.message ??
    "Translation failed";
  return new TranslateUpstreamError(message, status);
}

const DEFAULT_MODEL = "openai/gpt-oss-120b:free";
const TIMEOUT_MS = 20_000;

/** Lazily-built singleton client, created on the first request once the API key
 *  has been validated. */
let client: OpenRouter | null = null;

function getClient(): OpenRouter {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new TranslateConfigError("Translation service is not configured");
  }
  client ??= new OpenRouter({ apiKey });
  return client;
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

/** Reject after TIMEOUT_MS so a hung upstream call can't block the request. */
function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Translation timed out")), TIMEOUT_MS),
    ),
  ]);
}

/** Translate `text` between FR and EN via the OpenRouter SDK. Server-only.
 *  Throws TranslateConfigError if unconfigured, or Error on upstream failure. */
export async function translateText(input: TranslateInput): Promise<string> {
  const openRouter = getClient();
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  let content: unknown;
  try {
    const result = await withTimeout(
      openRouter.chat.send({
        chatRequest: {
          model,
          temperature: 0.2,
          messages: buildMessages(input),
        },
      }),
    );
    content = result.choices?.[0]?.message?.content;
  } catch (err) {
    if (err instanceof Error && err.message === "Translation timed out") {
      throw new TranslateUpstreamError(err.message, 504);
    }
    throw describeUpstreamError(err);
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Translation service returned an empty result");
  }

  return unquote(content);
}
