import {
  buildPrompt,
  normalizeAchievements,
  normalizeBlockAnalysis,
  normalizePlan,
  normalizeSuggestion,
  type AchievementIdea,
  type AchievementsInput,
  type AiAction,
  type AiSuggestion,
  type AnalyzeScheduleInput,
  type BlockAnalysis,
  type BlockAnalysisInput,
  type BuiltPrompt,
  type DailyInsightInput,
  type PlanInput,
  type PlanResult,
  type SuggestBlockInput,
} from '../../../shared/ai';

const CLIENT_KEY = (import.meta.env.VITE_GEMINI_API_KEY ?? '').trim();
const MODEL = (import.meta.env.VITE_GEMINI_MODEL ?? '').trim() || 'gemini-2.5-flash';
const GOOGLE_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const PROXY_PATH = '/api/ai';

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

export function getAiModel(): string {
  return MODEL;
}

interface RawResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

async function callGoogle(built: BuiltPrompt): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${GOOGLE_ENDPOINT}/${MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': CLIENT_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: built.prompt }] }],
        systemInstruction: { parts: [{ text: built.system }] },
        generationConfig: {
          temperature: built.temperature,
          ...(built.json ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });
  } catch {
    throw new GeminiError('Không kết nối được tới máy chủ Gemini. Kiểm tra kết nối mạng của bạn.');
  }

  const data: RawResponse = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GeminiError(data.error?.message || `Yêu cầu Gemini thất bại (mã ${res.status}).`);
  }

  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('').trim();
  if (!text) throw new GeminiError('Gemini không trả về nội dung.');
  return text;
}

async function callProxy(action: AiAction, input: unknown): Promise<string> {
  let res: Response;
  try {
    res = await fetch(PROXY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, input }),
    });
  } catch {
    throw new GeminiError('Không kết nối được tới máy chủ AI.');
  }

  const data: { text?: string; error?: string } = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GeminiError(data.error || `Máy chủ AI trả về lỗi (mã ${res.status}).`);
  }

  const text = typeof data.text === 'string' ? data.text.trim() : '';
  if (!text) throw new GeminiError('AI không trả về nội dung.');
  return text;
}

async function run(action: AiAction, input: unknown): Promise<string> {
  if (CLIENT_KEY) return callGoogle(buildPrompt(action, input));
  return callProxy(action, input);
}

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new GeminiError('Không đọc được kết quả trả về từ AI.');
  }
}

const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, task: () => Promise<T>): Promise<T> {
  const existing = cache.get(key);
  if (existing) return existing as Promise<T>;

  const promise = task().catch(err => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, promise);
  return promise;
}

export function clearAiCache(): void {
  cache.clear();
}

export function analyzeSchedule(input: AnalyzeScheduleInput): Promise<string> {
  return cached(`analyze:${JSON.stringify(input)}`, () => run('analyze', input));
}

export function suggestForBlock(input: SuggestBlockInput): Promise<AiSuggestion> {
  return cached(`suggest:${JSON.stringify(input)}`, async () => {
    const raw = await run('suggest', input);
    return normalizeSuggestion(parseJson<unknown>(raw));
  });
}

export function dailyInsight(input: DailyInsightInput): Promise<string> {
  return cached(`daily:${JSON.stringify(input)}`, () => run('daily', input));
}

export function planSchedule(input: PlanInput): Promise<PlanResult> {
  return cached(`plan:${JSON.stringify(input)}`, async () => {
    const raw = await run('plan', input);
    return normalizePlan(parseJson<unknown>(raw));
  });
}

export function analyzeBlock(input: BlockAnalysisInput): Promise<BlockAnalysis> {
  return cached(`block:${JSON.stringify(input)}`, async () => {
    const raw = await run('block', input);
    return normalizeBlockAnalysis(parseJson<unknown>(raw));
  });
}

export function generateAchievements(input: AchievementsInput): Promise<AchievementIdea[]> {
  return cached(`achievements:${JSON.stringify(input)}`, async () => {
    const raw = await run('achievements', input);
    return normalizeAchievements(parseJson<unknown>(raw));
  });
}
