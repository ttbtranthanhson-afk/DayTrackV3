import {
  buildPrompt,
  normalizeAchievements,
  normalizeBlockAnalysis,
  normalizeDailyInsight,
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
  type DailyInsight,
  type DailyInsightInput,
  type PlanInput,
  type PlanResult,
  type SuggestBlockInput,
} from '../../../shared/ai';
import {
  generateWithFallback,
  GeminiRequestError,
  resolveKeys,
  resolveModels,
} from '../../../shared/gemini';
import { isTutorialActive } from '../tutorial/tutorialMode';
import {
  tutorialPlanSchedule,
  tutorialBlockAnalysis,
  tutorialDailyInsight,
  tutorialAchievements,
} from '../tutorial/tutorialAi';

const PROXY_PATH = '/api/ai';

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

function clientKeys(): string[] {
  return resolveKeys(import.meta.env.VITE_GEMINI_API_KEY, import.meta.env.VITE_GEMINI_API_KEYS);
}

export function getAiModel(): string {
  return resolveModels(import.meta.env.VITE_GEMINI_MODEL)[0];
}

async function callGoogle(built: BuiltPrompt, keys: string[]): Promise<string> {
  const models = resolveModels(import.meta.env.VITE_GEMINI_MODEL);
  try {
    const { text } = await generateWithFallback({
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
    return text;
  } catch (err) {
    if (err instanceof GeminiRequestError) throw new GeminiError(err.message);
    throw new GeminiError('Không kết nối được tới máy chủ Gemini. Kiểm tra kết nối mạng của bạn.');
  }
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
  const keys = clientKeys();
  if (action === 'plan' || action === 'daily' || action === 'suggest' || action === 'block') {
    // These must run server-side so the DayTrack ruleset is injected.
    try {
      return await callProxy(action, input);
    } catch (err) {
      if (keys.length) return callGoogle(buildPrompt(action, input), keys);
      throw err;
    }
  }
  if (keys.length) return callGoogle(buildPrompt(action, input), keys);
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

export function dailyInsight(input: DailyInsightInput): Promise<DailyInsight> {
  if (isTutorialActive()) {
    return tutorialDailyInsight().then(summary => ({ summary, items: [] }));
  }
  return cached(`daily:${JSON.stringify(input)}`, async () => {
    const raw = await run('daily', input);
    return normalizeDailyInsight(parseJson<unknown>(raw));
  });
}

export function planSchedule(input: PlanInput): Promise<PlanResult> {
  if (isTutorialActive()) return tutorialPlanSchedule();
  return cached(`plan:${JSON.stringify(input)}`, async () => {
    const raw = await run('plan', input);
    return normalizePlan(parseJson<unknown>(raw));
  });
}

export function analyzeBlock(input: BlockAnalysisInput): Promise<BlockAnalysis> {
  if (isTutorialActive()) return tutorialBlockAnalysis();
  return cached(`block:${JSON.stringify(input)}`, async () => {
    const raw = await run('block', input);
    return normalizeBlockAnalysis(parseJson<unknown>(raw));
  });
}

export function generateAchievements(input: AchievementsInput): Promise<AchievementIdea[]> {
  if (isTutorialActive()) return tutorialAchievements();
  return cached(`achievements:${JSON.stringify(input)}`, async () => {
    const raw = await run('achievements', input);
    return normalizeAchievements(parseJson<unknown>(raw));
  });
}
