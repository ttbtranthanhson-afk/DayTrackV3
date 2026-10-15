export const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export const DEFAULT_FREE_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
];

const QUOTA_COOLDOWN_MS = 60_000;
const AUTH_STATUSES = new Set([401, 403]);
const cooldowns = new Map<string, number>();

export class GeminiRequestError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'GeminiRequestError';
    this.status = status;
  }
}

export function parseList(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(/[,\n]/)
    .map(part => part.trim())
    .filter(Boolean);
}

export function resolveModels(value: string | null | undefined): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const model of [...parseList(value), ...DEFAULT_FREE_MODELS]) {
    if (!seen.has(model)) {
      seen.add(model);
      result.push(model);
    }
  }
  return result;
}

export function resolveKeys(...values: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    for (const key of parseList(value)) {
      if (!seen.has(key)) {
        seen.add(key);
        result.push(key);
      }
    }
  }
  return result;
}

interface GeminiRaw {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

export interface GeminiFallbackOptions {
  keys: string[];
  models: string[];
  buildBody: (model: string) => unknown;
  endpoint?: string;
  signal?: AbortSignal;
}

export interface GeminiFallbackResult {
  text: string;
  model: string;
}

function isQuotaError(status: number, message: string): boolean {
  if (status === 429) return true;
  const text = message.toLowerCase();
  return (
    text.includes('quota') ||
    text.includes('resource_exhausted') ||
    text.includes('resource exhausted') ||
    text.includes('rate limit') ||
    text.includes('exceeded')
  );
}

function cooldownKey(key: string, model: string): string {
  return `${key}::${model}`;
}

function isCooling(key: string, model: string, now: number): boolean {
  const until = cooldowns.get(cooldownKey(key, model));
  return until !== undefined && until > now;
}

export async function generateWithFallback(options: GeminiFallbackOptions): Promise<GeminiFallbackResult> {
  if (options.models.length === 0) {
    throw new GeminiRequestError('Chưa cấu hình model AI nào.');
  }
  if (options.keys.length === 0) {
    throw new GeminiRequestError('Chưa cấu hình API key cho AI.');
  }

  const endpoint = options.endpoint ?? GEMINI_ENDPOINT;
  const now = Date.now();
  let lastMessage = '';
  let lastStatus = 0;

  for (const key of options.keys) {
    const fresh = options.models.filter(model => !isCooling(key, model, now));
    const models = fresh.length ? fresh : options.models;
    let keyBroken = false;

    for (const model of models) {
      if (options.signal?.aborted) {
        throw new GeminiRequestError('Đã hủy yêu cầu AI.', 499);
      }

      let res: Response;
      try {
        res = await fetch(`${endpoint}/${model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify(options.buildBody(model)),
          signal: options.signal,
        });
      } catch {
        if (options.signal?.aborted) {
          throw new GeminiRequestError('Đã hủy yêu cầu AI.', 499);
        }
        lastStatus = 0;
        lastMessage = 'Không kết nối được tới Gemini.';
        continue;
      }

      const data = (await res.json().catch(() => ({}))) as GeminiRaw;

      if (res.ok) {
        const text = (data.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('') ?? '').trim();
        if (text) return { text, model };
        lastStatus = res.status;
        lastMessage = 'Gemini không trả về nội dung.';
        continue;
      }

      lastStatus = res.status;
      lastMessage = data.error?.message || `Gemini trả về lỗi (mã ${res.status}).`;

      if (isQuotaError(res.status, lastMessage)) {
        cooldowns.set(cooldownKey(key, model), Date.now() + QUOTA_COOLDOWN_MS);
        continue;
      }

      if (AUTH_STATUSES.has(res.status)) {
        keyBroken = true;
        break;
      }
    }

    if (keyBroken) continue;
  }

  throw new GeminiRequestError(lastMessage || 'Không thể gọi Gemini.', lastStatus);
}
