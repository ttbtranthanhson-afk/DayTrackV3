import { buildPrompt, isAiAction, normalizePlan, type BuiltPrompt, type PlanInput, type PlanOption } from '../shared/ai';
import { generateWithFallback, resolveKeys, resolveModels } from '../shared/gemini';
import { buildRuleContext, type RetrieveInput } from '../shared/rules/retrieve';
import { buildEngineOptions } from '../shared/rules/engine';
import { hardGate } from '../shared/rules/validate';

declare const process: { env: Record<string, string | undefined> };

export const config = { runtime: 'edge' };

const MAX_BODY_BYTES = 20_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const PLAN_TIMEOUT_MS = 10_000;
const GENERATE_TIMEOUT_MS = 20_000;

const hits = new Map<string, number[]>();

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function runWithTimeout<T>(run: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

function isTimeoutError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === 'AbortError' || err.message.includes('Đã hủy yêu cầu AI');
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function safeParse(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return undefined;
  }
}

function injectRuleContext(action: string, input: unknown): void {
  if (!input || typeof input !== 'object') return;
  const obj = input as Record<string, unknown>;
  const profile = obj.profile as RetrieveInput['profile'];
  try {
    if ((action === 'suggest' || action === 'block') && typeof obj.title === 'string') {
      obj.ruleContext = buildRuleContext({
        day: String(obj.day ?? ''),
        profile,
        schedule: [
          {
            title: obj.title,
            time: String(obj.time ?? ''),
            tasks: Array.isArray(obj.tasks) ? (obj.tasks as string[]) : undefined,
          },
        ],
      });
    }
  } catch {
    // retrieval is best-effort; the prompt still works without it
  }
}

function dedupeOptions(options: PlanOption[]): PlanOption[] {
  const seen = new Set<string>();
  const out: PlanOption[] = [];
  for (const option of options) {
    const fp = `${option.id}|${option.blocks.map(b => `${b.title}${b.start}${b.end}`).join('|')}`;
    if (seen.has(fp)) continue;
    seen.add(fp);
    out.push(option);
  }
  return out;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json(405, { error: 'Phương thức không được hỗ trợ.' });
  }

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const origin = req.headers.get('origin');
  const selfHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const selfProto = req.headers.get('x-forwarded-proto') || 'https';
  const selfOrigin = selfHost ? `${selfProto}://${selfHost}` : '';
  const isSameOrigin = Boolean(origin && selfOrigin && origin === selfOrigin);
  const isAllowed = Boolean(origin && (isSameOrigin || allowedOrigins.includes(origin)));

  if (!isAllowed) {
    return json(403, { error: 'Yêu cầu không xuất phát từ domain được phép.' });
  }

  const keys = resolveKeys(process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEYS);
  if (keys.length === 0) {
    return json(500, { error: 'Máy chủ chưa cấu hình GEMINI_API_KEY.' });
  }
  const models = resolveModels(process.env.GEMINI_MODEL);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return json(429, { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau một phút.' });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return json(413, { error: 'Dữ liệu gửi lên quá lớn.' });
  }

  let body: { action?: unknown; input?: unknown };
  try {
    body = JSON.parse(rawBody || '{}');
  } catch {
    return json(400, { error: 'Dữ liệu JSON không hợp lệ.' });
  }

  if (!isAiAction(body.action)) {
    return json(400, { error: 'Hành động không hợp lệ.' });
  }

  if (body.action === 'plan' && body.input && typeof body.input === 'object') {
    const planInput = body.input as PlanInput & RetrieveInput;

    let engineOptions: PlanOption[] = [];
    try {
      engineOptions = buildEngineOptions(planInput);
    } catch {
      // deterministic engine is best-effort; the LLM path can still succeed
    }

    try {
      planInput.ruleContext = buildRuleContext(planInput);
    } catch {
      // retrieval is best-effort; the prompt still works without it
    }

    let llmOptions: PlanOption[] = [];
    try {
      const built = buildPrompt('plan', planInput);
      const outcome = await runWithTimeout(
        signal =>
          generateWithFallback({
            keys,
            models,
            signal,
            buildBody: model => ({
              contents: [{ role: 'user', parts: [{ text: built.prompt }] }],
              systemInstruction: { parts: [{ text: built.system }] },
              generationConfig: {
                temperature: built.temperature,
                responseMimeType: 'application/json',
                ...(model.includes('2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
              },
            }),
          }),
        PLAN_TIMEOUT_MS,
      );
      const parsed = safeParse(outcome.text);
      if (parsed !== undefined) {
        llmOptions = hardGate(normalizePlan(parsed), planInput).result.options;
      }
    } catch {
      // fall back to deterministic engine options below
    }

    const merged = dedupeOptions([...llmOptions, ...engineOptions]).slice(0, 2);
    if (merged.length) {
      return json(200, { text: JSON.stringify({ options: merged }) });
    }
    return json(502, { error: 'Không thể tạo phương án lịch trình. Vui lòng thử lại.' });
  }

  if (body.action === 'suggest' || body.action === 'block') {
    injectRuleContext(body.action, body.input);
  }

  let built: BuiltPrompt;
  try {
    built = buildPrompt(body.action, body.input);
  } catch (err) {
    return json(400, { error: err instanceof Error ? err.message : 'Dữ liệu không hợp lệ.' });
  }

  let outcome: { text: string; model: string };
  try {
    outcome = await runWithTimeout(
      signal =>
        generateWithFallback({
          keys,
          models,
          signal,
          buildBody: model => ({
            contents: [{ role: 'user', parts: [{ text: built.prompt }] }],
            systemInstruction: { parts: [{ text: built.system }] },
            generationConfig: {
              temperature: built.temperature,
              ...(built.json ? { responseMimeType: 'application/json' } : {}),
              ...(model.includes('2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
            },
          }),
        }),
      GENERATE_TIMEOUT_MS,
    );
  } catch (err) {
    if (isTimeoutError(err)) {
      return json(504, { error: 'AI phản hồi quá chậm. Vui lòng thử lại.' });
    }
    return json(502, { error: err instanceof Error ? err.message : 'Không thể gọi Gemini.' });
  }

  return json(200, { text: outcome.text, model: outcome.model });
}
