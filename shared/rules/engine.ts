import type { BlockType, PlanAnalysis, PlanInput, PlanOption, PlannedBlock } from '../ai';
import {
  blockWindowFrom,
  classifyBlock,
  exerciseItemLines,
  healthAdvice,
  mealItemLines,
  mealWindowFrom,
  methodLabel,
  methodSteps,
  resolveGoalKey,
  resolveProfile,
  type BlockClassification,
  type ProfileResolution,
} from './retrieve';

type Raw = {
  title: string;
  type: BlockType;
  kind: BlockClassification['kind'];
  start: number;
  end: number;
  tasks: string[];
  cls: BlockClassification;
  sleep: boolean;
  commute: boolean;
  fixed: boolean;
  mealTime?: 'sang' | 'trua' | 'toi';
};

type Range = { start: number; end: number };

const DAY_START = 5 * 60;
const DAY_END = 23 * 60;

function toMin(value: string | undefined): number | null {
  const m = /(\d{1,2}):(\d{2})/.exec(value ?? '');
  if (!m) return null;
  return +m[1] * 60 + +m[2];
}

function fmt(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function rangeOf(value: string | undefined): Range | null {
  const m = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/.exec(value ?? '');
  if (!m) return null;
  const start = toMin(m[1]);
  const end = toMin(m[2]);
  if (start == null || end == null) return null;
  return { start, end };
}

function parseBusy(busy: string[]): Range[] {
  const ranges: Range[] = [];
  for (const item of busy) {
    const r = rangeOf(item);
    if (r) {
      ranges.push(r);
      continue;
    }
    const single = toMin(item);
    if (single != null) ranges.push({ start: single, end: single + 60 });
  }
  return ranges.sort((a, b) => a.start - b.start);
}

function overlaps(a: Range, b: Range): boolean {
  return a.start < b.end && b.start < a.end;
}

function firstFree(occupied: Range[], preferred: number, duration: number): number {
  let s = Math.max(DAY_START, preferred);
  let guard = 0;
  while (guard < 200) {
    const conflict = occupied.find(o => s < o.end && o.start < s + duration);
    if (!conflict) break;
    s = conflict.end;
    guard += 1;
  }
  if (s + duration > DAY_END) s = Math.max(DAY_START, DAY_END - duration);
  return s;
}

function firstGap(occupied: Range[], preferred: number, maxDuration: number, minDuration: number): Range {
  const clipped = occupied
    .map(o => ({ start: Math.max(o.start, DAY_START), end: Math.min(o.end, DAY_END) }))
    .filter(o => o.end > o.start)
    .sort((a, b) => a.start - b.start);

  const gaps: Range[] = [];
  let cursor = DAY_START;
  for (const o of clipped) {
    if (o.start > cursor) gaps.push({ start: cursor, end: o.start });
    cursor = Math.max(cursor, o.end);
  }
  if (cursor < DAY_END) gaps.push({ start: cursor, end: DAY_END });

  const usable = gaps.filter(g => g.end - g.start >= minDuration);
  if (!usable.length) {
    const fallback = Math.max(DAY_START, Math.min(preferred, DAY_END - minDuration));
    return { start: fallback, end: fallback + minDuration };
  }

  const chosen =
    usable.find(g => g.start <= preferred && preferred < g.end) ??
    usable.find(g => g.start > preferred) ??
    usable[usable.length - 1];

  const start = Math.max(chosen.start, Math.min(preferred, chosen.end - minDuration));
  const duration = Math.max(minDuration, Math.min(maxDuration, chosen.end - start));
  return { start, end: start + duration };
}

function mealTimeOf(title: string): 'sang' | 'trua' | 'toi' | undefined {
  const t = title.toLowerCase();
  if (/sáng/.test(t)) return 'sang';
  if (/trưa/.test(t)) return 'trua';
  if (/tối|chiều/.test(t)) return 'toi';
  return undefined;
}

function toRaw(item: { title: string; time: string; tasks?: string[] }): Raw {
  const cls = classifyBlock(item.title, item.time, item.tasks);
  const r = rangeOf(item.time) ?? { start: 8 * 60, end: 9 * 60 };
  const title = item.title;
  const low = title.toLowerCase();
  const sleep = cls.kind === 'rest' && /ngủ/.test(low);
  const commute = /đi học|đi làm|đến (trường|công ty|chỗ)|di chuyển|commute/.test(low);
  const rhythm = /thức dậy|dậy sớm|thức giấc|nghỉ trưa|ngủ trưa/.test(low);

  let type: BlockType;
  if (cls.kind === 'eating') type = 'eating';
  else if (cls.kind === 'exercise') type = 'exercise';
  else if (cls.kind === 'study' && !commute) type = 'study';
  else type = 'other';

  return {
    title,
    type,
    kind: cls.kind,
    start: r.start,
    end: r.end,
    tasks: item.tasks ?? [],
    cls,
    sleep,
    commute,
    fixed: sleep || commute || type === 'eating' || cls.kind === 'rest' || rhythm,
    mealTime: cls.kind === 'eating' ? mealTimeOf(title) : undefined,
  };
}

function priorityOf(raw: Raw): number {
  if (raw.sleep) return 0;
  if (raw.commute) return 1;
  if (raw.type === 'eating') return 2;
  return 3;
}

function defaultTimeOptions(start: number, duration: number): string[] {
  return [0, 30, 60].map(offset => `${fmt(start + offset)} - ${fmt(start + offset + duration)}`);
}

function analysisFor(raw: Raw, p: ProfileResolution, goalKey: string, advice: string[]): PlanAnalysis {
  const duration = Math.max(15, raw.end - raw.start);
  const base: PlanAnalysis = {
    timeOptions: defaultTimeOptions(raw.start, duration),
    suggestions: [],
    healthTips: [],
    why: '',
  };

  if (raw.commute) {
    base.why = 'Giữ nguyên thời gian cố định theo lịch học / đi làm.';
    base.healthTips = advice.slice(0, 1);
    return base;
  }

  const lowTitle = raw.title.toLowerCase();
  if (/thức dậy|dậy sớm|thức giấc/.test(lowTitle)) {
    base.suggestions = ['Uống 1 cốc nước, mở rèm đón ánh sáng, vươn vai 2-3 phút.'];
    base.why = 'Đón ánh sáng sớm giúp ổn định nhịp sinh học và tỉnh táo cả ngày.';
    base.healthTips = advice.slice(0, 2);
    return base;
  }

  if (raw.kind === 'rest' && !raw.sleep && /trưa/.test(lowTitle)) {
    base.suggestions = ['Ngủ trưa 15-20 phút, đặt báo thức để không ngủ quá 30 phút.'];
    base.why = 'Ngủ trưa ngắn giúp hồi phục năng lượng mà không bị uể oải buổi chiều.';
    base.healthTips = advice.slice(0, 2);
    return base;
  }

  if (raw.type === 'eating') {
    base.need = p.need;
    base.suggestions = mealItemLines(goalKey, raw.mealTime, 3);
    base.why = 'Bữa ăn cố định theo hồ sơ, không bỏ bữa để ổn định năng lượng cả ngày.';
    base.healthTips = advice.slice(0, 2);
    return base;
  }

  if (raw.type === 'exercise') {
    base.need = p.need;
    const exGoal = p.exerciseGoals[0] ?? 'Sức bền - tim phổi';
    base.suggestions = exerciseItemLines(exGoal, 3);
    base.why = 'Xếp vào khung giờ vận động tốt để đốt năng lượng và phục hồi tinh thần.';
    base.healthTips = advice.slice(0, 2);
    return base;
  }

  if (raw.type === 'study') {
    const code = raw.cls.methodCodes[0];
    const resolved = code && methodLabel(code) ? code : methodLabel('M16') ? 'M16' : 'M01';
    base.method = methodLabel(resolved);
    base.methodSteps = methodSteps(resolved);
    base.healthTips = [
      `Chia phiên tối đa ${p.maxSessionMin} phút, nghỉ 5 phút giữa các phiên.`,
      'Ngồi thẳng lưng, để mắt nghỉ sau mỗi phiên.',
      ...advice,
    ].slice(0, 3);
    base.why = 'Đặt vào khối cao điểm để tập trung sâu, tránh khối trũng buổi trưa.';
    return base;
  }

  if (raw.sleep) {
    base.suggestions = ['Tắt màn hình trước ngủ, giữ phòng tối và yên tĩnh.'];
    base.why = 'Giữ giờ ngủ theo hồ sơ để đảm bảo nhịp sinh học.';
    base.healthTips = advice.slice(0, 2);
    return base;
  }

  base.suggestions = ['Nghỉ ngơi nhẹ, thư giãn, hạn chế màn hình sáng.'];
  base.why = 'Giữ khoảng nghỉ để phục hồi năng lượng giữa các hoạt động.';
  base.healthTips = advice.slice(0, 2);
  return base;
}

interface Variant {
  id: string;
  name: string;
  description: string;
  studyKey: string;
  exerciseKey: string;
}

const VARIANTS: Variant[] = [
  {
    id: 'rules',
    name: 'Theo quy tắc DayTrack',
    description: 'Giữ cố định bữa ăn, giấc ngủ; học ở khối cao điểm chiều và thêm buổi vận động.',
    studyKey: 'D1',
    exerciseKey: 'VD',
  },
  {
    id: 'evening',
    name: 'Ưu tiên buổi tối',
    description: 'Giữ cố định bữa ăn, giấc ngủ; dồn việc học vào khối cao điểm buổi tối.',
    studyKey: 'D2',
    exerciseKey: 'VD',
  },
];

function syntheticRaw(
  title: string,
  type: BlockType,
  kind: BlockClassification['kind'],
  start: number,
  end: number,
  opts: { sleep?: boolean; mealTime?: Raw['mealTime'] } = {}
): Raw {
  return {
    title,
    type,
    kind,
    start,
    end,
    tasks: [],
    cls: { title, time: '', kind, methodCodes: [] },
    sleep: opts.sleep ?? false,
    commute: false,
    fixed: true,
    mealTime: opts.mealTime,
  };
}

const RHYTHM_MEALS: { time: 'sang' | 'trua' | 'toi'; title: string; test: RegExp }[] = [
  { time: 'sang', title: 'Ăn sáng', test: /ăn sáng|bữa sáng/ },
  { time: 'trua', title: 'Ăn trưa', test: /ăn trưa|bữa trưa/ },
  { time: 'toi', title: 'Ăn tối', test: /ăn tối|bữa tối/ },
];

function ensureRhythm(raws: Raw[], p: ProfileResolution): Raw[] {
  const row = p.row as Record<string, unknown>;
  const items = raws.slice();
  const titleHas = (re: RegExp): boolean => items.some(r => re.test(r.title.toLowerCase()));
  const meals = (row.meals ?? {}) as Record<string, string>;
  const blocks = (row.blocks ?? {}) as Record<string, string>;
  const wake = toMin(String(row.wake ?? ''));
  const sleep = toMin(String(row.sleep ?? ''));

  for (const meal of RHYTHM_MEALS) {
    const win = rangeOf(meals[meal.time]);
    const exists = items.some(r => r.type === 'eating' && r.mealTime === meal.time) || titleHas(meal.test);
    if (win && !exists) {
      items.push(syntheticRaw(meal.title, 'eating', 'eating', win.start, win.end, { mealTime: meal.time }));
    }
  }

  if (wake != null && !titleHas(/thức dậy|dậy sớm|thức giấc/)) {
    const breakfast = rangeOf(meals.sang);
    let end = wake + 30;
    if (breakfast && breakfast.start > wake) end = Math.min(end, breakfast.start);
    items.push(syntheticRaw('Thức dậy', 'other', 'other', wake, Math.max(wake + 15, end)));
  }

  const napWin = rangeOf(blocks.TR);
  const hasNap =
    titleHas(/nghỉ trưa|ngủ trưa/) ||
    items.some(r => r.kind === 'rest' && !r.sleep && r.start >= 11 * 60 + 30 && r.start <= 15 * 60);
  if (napWin && !hasNap) {
    items.push(syntheticRaw('Nghỉ trưa', 'other', 'rest', napWin.start, napWin.start + 20));
  }

  if (sleep != null && wake != null && !items.some(r => r.sleep)) {
    items.push(syntheticRaw('Ngủ', 'other', 'rest', sleep, wake, { sleep: true }));
  }

  return items;
}

function layout(raws: Raw[], p: ProfileResolution, variant: Variant, busy: Range[]): Raw[] {
  const row = p.row as Record<string, unknown>;
  const items: Raw[] = ensureRhythm(raws, p).map(r => ({ ...r }));

  if (!items.some(r => r.type === 'exercise')) {
    const win = blockWindowFrom(row, variant.exerciseKey);
    const start = win ? toMin(win[0]) ?? 17 * 60 : 17 * 60;
    items.push({
      title: 'Vận động',
      type: 'exercise',
      kind: 'exercise',
      start,
      end: start + 30,
      tasks: [],
      cls: { title: 'Vận động', time: '', kind: 'exercise', methodCodes: [] },
      sleep: false,
      commute: false,
      fixed: false,
    });
  }

  const fixed = items.filter(r => r.fixed).sort((a, b) => priorityOf(a) - priorityOf(b) || a.start - b.start);
  const movable = items.filter(r => !r.fixed).sort((a, b) => a.start - b.start);

  const studyWin = blockWindowFrom(row, variant.studyKey) ?? blockWindowFrom(row, 'D1') ?? blockWindowFrom(row, 'D2');
  const studyPreferred = studyWin ? toMin(studyWin[0]) ?? firstStudyStart(items) : firstStudyStart(items);
  const exWin = blockWindowFrom(row, variant.exerciseKey);
  const exPreferred = exWin ? toMin(exWin[0]) ?? 17 * 60 : 17 * 60;

  const occupied: Range[] = [];

  for (const r of fixed) {
    if (r.sleep) {
      const end = ((r.end % 1440) + 1440) % 1440;
      occupied.push({ start: r.start, end: DAY_END });
      occupied.push({ start: 0, end });
      continue;
    }
    if (r.type === 'eating') {
      const win = r.mealTime ? mealWindowFrom(row, r.mealTime) : undefined;
      if (win) {
        const ws = toMin(win[0]);
        const we = toMin(win[1]);
        const conflicts = ws != null && we != null && occupied.some(o => ws < o.end && o.start < we);
        if (ws != null && we != null && we > ws && !conflicts) {
          r.start = ws;
          r.end = we;
        }
      }
    }
    const duration = Math.max(5, r.end - r.start);
    if (r.kind === 'rest') {
      const placed = firstGap(occupied, r.start, duration, 15);
      r.start = placed.start;
      r.end = placed.end;
    } else {
      const s = firstFree(occupied, r.start, duration);
      r.start = s;
      r.end = s + duration;
    }
    occupied.push({ start: r.start, end: r.end });
    occupied.sort((a, b) => a.start - b.start);
  }

  const movableOccupied = [...occupied, ...busy].sort((a, b) => a.start - b.start);

  for (const r of movable) {
    const preferred = r.type === 'study' ? studyPreferred : exPreferred;
    const duration =
      r.type === 'study'
        ? Math.max(20, Math.min(r.end - r.start || 60, p.maxSessionMin))
        : Math.max(20, r.end - r.start || 30);
    const s = firstFree(movableOccupied, preferred, duration);
    r.start = s;
    r.end = s + duration;
    movableOccupied.push({ start: s, end: s + duration + (r.type === 'study' ? 5 : 0) });
    movableOccupied.sort((a, b) => a.start - b.start);
  }

  return items.sort((a, b) => a.start - b.start || a.end - b.end);
}

function firstStudyStart(items: Raw[]): number {
  const study = items.find(r => r.type === 'study');
  return study ? study.start : 15 * 60 + 30;
}

function optionFrom(raws: Raw[], p: ProfileResolution, variant: Variant): PlanOption {
  const goalKey = resolveGoalKey(p);
  const advice = healthAdvice(p);
  const blocks: PlannedBlock[] = raws.map(raw => ({
    title: raw.title,
    type: raw.type,
    start: fmt(raw.start),
    end: fmt(raw.end),
    tasks: raw.tasks,
    analysis: analysisFor(raw, p, goalKey, advice),
  }));
  return { id: `engine-${variant.id}`, name: variant.name, description: variant.description, blocks };
}

export function buildEngineOptions(input: PlanInput): PlanOption[] {
  const p = resolveProfile(input.profile);
  const raws = (input.schedule ?? []).map(toRaw);
  if (!raws.length) return [];
  const busy = parseBusy(input.busy ?? []);
  return VARIANTS.map(variant => optionFrom(layout(raws, p, variant, busy), p, variant)).filter(
    option => option.blocks.length > 0
  );
}
