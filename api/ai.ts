import { buildPrompt, isAiAction, type BuiltPrompt } from '../shared/ai';
import { generateWithFallback, resolveKeys, resolveModels } from '../shared/gemini';

declare const process: { env: Record<string, string | undefined> };

export const config = { runtime: 'edge' };

const MAX_BODY_BYTES = 20_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map<string, number[]>();

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS_PER_WINDOW;
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

  let built: BuiltPrompt;
  try {
    built = buildPrompt(body.action, body.input);
  } catch (err) {
    return json(400, { error: err instanceof Error ? err.message : 'Dữ liệu không hợp lệ.' });
  }

  let outcome: { text: string; model: string };
  try {
    outcome = await generateWithFallback({
      keys,
      models,
      buildBody: model => ({
        contents: [{ role: 'user', parts: [{ text: built.prompt }] }],
        systemInstruction: { parts: [{ text: built.system }] },
        generationConfig: {
          temperature: built.temperature,
          ...(built.json ? { responseMimeType: 'application/json' } : {}),
          ...(model.includes('2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      }),
    });
  } catch (err) {
    return json(502, { error: err instanceof Error ? err.message : 'Không thể gọi Gemini.' });
  }

  return json(200, { text: outcome.text, model: outcome.model });
}
