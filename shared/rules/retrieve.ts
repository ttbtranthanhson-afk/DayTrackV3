import data from './data.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Map2 = Record<string, any>;
const R = data as unknown as {
  jobs: Record<string, string>;
  profiles: Record<string, Map2>;
  workTypes: Record<string, Map2>;
  tasks: Record<string, Map2>;
  taskDetails: Record<string, Map2>;
  matrix: Record<string, Record<string, string>>;
  health: Record<string, Map2>;
  mental: Record<string, Map2>;
  methods: Record<string, Map2>;
  principles: Map2[];
  scenarios: Map2[];
  mealsByGoal: Record<string, Map2[]>;
  exercisesByGoal: Record<string, Map2[]>;
  sports: Map2[];
};

export interface PlanProfile {
  job?: string;
  health?: string;
  mental?: string;
}

export interface RetrieveInput {
  day?: string;
  schedule?: { title: string; time: string; tasks?: string[] }[];
  busy?: string[];
  profile?: PlanProfile;
}

function norm(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBest(map: Record<string, unknown>, text: string): string | undefined {
  const t = norm(text);
  if (!t) return undefined;
  let best: string | undefined;
  let bestLen = 0;
  for (const key of Object.keys(map)) {
    const nk = norm(key);
    if (nk === t) return key;
    if (nk.includes(t) || t.includes(nk)) {
      if (nk.length > bestLen) {
        best = key;
        bestLen = nk.length;
      }
    }
  }
  return best;
}

function splitConditions(text?: string): string[] {
  if (!text) return [];
  return String(text)
    .split(/[,;/\n|]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function clean(text: unknown, max = 220): string {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

const NEED_BY_GOAL: Record<string, 'gain' | 'lose' | 'muscle'> = {
  'tăng cân': 'gain',
  'giảm cân': 'lose',
  'giảm mỡ giữ cơ': 'lose',
  'giảm cân / giảm mỡ': 'lose',
  'duy trì cân nặng': 'muscle',
  'tăng cơ': 'muscle',
};

export interface ProfileResolution {
  profileId: string;
  matchedJob: string;
  row: Map2;
  loadFactor: number;
  maxSessionMin: number;
  appliedFactors: string[];
  healthMatches: string[];
  mentalMatches: string[];
  need?: 'gain' | 'lose' | 'muscle';
  mealGoal?: string;
  exerciseGoals: string[];
}

export function resolveProfile(profile?: PlanProfile): ProfileResolution {
  const jobKey = findBest(R.jobs, profile?.job ?? '');
  const profileId = (jobKey && R.jobs[jobKey]) || 'P03';
  const row = R.profiles[profileId] ?? R.profiles['P03'] ?? {};

  let loadFactor = 1;
  let maxSessionMin = 50;
  const appliedFactors: string[] = [];
  const healthMatches: string[] = [];
  const mentalMatches: string[] = [];
  let need: 'gain' | 'lose' | 'muscle' | undefined;
  let mealGoal: string | undefined;
  const exerciseGoals: string[] = [];

  for (const cond of splitConditions(profile?.health)) {
    const key = findBest(R.health, cond);
    if (!key) continue;
    healthMatches.push(key);
    const h = R.health[key];
    if (typeof h.loadFactor === 'number' && h.loadFactor > 0) {
      loadFactor = Math.min(loadFactor, h.loadFactor);
    }
    if (typeof h.maxSession === 'number' && h.maxSession > 0) {
      maxSessionMin = Math.min(maxSessionMin, h.maxSession);
    }
    appliedFactors.push(`health:${key}(load ${h.loadFactor ?? '?'})`);
    if (h.mealGoal && h.mealGoal !== '-') {
      if (!mealGoal || mealGoal === 'Theo chuyên gia') mealGoal = h.mealGoal;
      need = need ?? NEED_BY_GOAL[norm(h.mealGoal)];
    }
    if (h.exGoal && h.exGoal !== '-') {
      for (const g of String(h.exGoal).split(',').map(s => s.trim()).filter(Boolean)) {
        if (!exerciseGoals.includes(g)) exerciseGoals.push(g);
      }
    }
  }

  for (const cond of splitConditions(profile?.mental)) {
    const key = findBest(R.mental, cond);
    if (!key) continue;
    mentalMatches.push(key);
    const m = R.mental[key];
    if (typeof m.loadFactor === 'number' && m.loadFactor > 0) {
      loadFactor = Math.min(loadFactor, m.loadFactor);
    }
    if (typeof m.session === 'number' && m.session > 0) {
      maxSessionMin = Math.min(maxSessionMin, m.session);
    }
    appliedFactors.push(`mental:${key}(load ${m.loadFactor ?? '?'})`);
  }

  return {
    profileId,
    matchedJob: jobKey ?? '',
    row,
    loadFactor: Math.round(loadFactor * 100) / 100,
    maxSessionMin,
    appliedFactors,
    healthMatches,
    mentalMatches,
    need,
    mealGoal,
    exerciseGoals,
  };
}

type BlockKind = 'eating' | 'exercise' | 'rest' | 'study' | 'other';

export interface BlockClassification {
  title: string;
  time: string;
  kind: BlockKind;
  workType?: string;
  workTypeName?: string;
  block?: string;
  matchedTask?: string;
  methodCodes: string[];
  avoid?: string;
  howto?: string;
  value?: string;
}

export function classifyBlock(title: string, time: string, tasks?: string[]): BlockClassification {
  const t = norm(title);
  const result: BlockClassification = { title, time, kind: 'other', methodCodes: [] };

  const isEating = /(^|\s)(ăn|bữa|xế)(\s|$)/.test(t) || /ăn/.test(t);
  const isRest = /ngủ|nghỉ|ngơi|nghỉ ngơi|thư giãn|relax/.test(t);
  const isExercise = /tập|thể dục|chạy|gym|bơi|bóng|vận động|yoga|đạp|aerob|đá cầu|cầu lông/.test(t);

  if (isEating) {
    result.kind = 'eating';
    return result;
  }
  if (isExercise) {
    result.kind = 'exercise';
    return result;
  }
  if (isRest) {
    result.kind = 'rest';
    return result;
  }

  const probe = [title, ...(tasks ?? [])].join(' ');
  const match = findBest(R.taskDetails, probe) ?? findBest(R.tasks, probe) ?? findBest(R.taskDetails, title);
  if (match) {
    const d = R.taskDetails[match] ?? R.tasks[match] ?? {};
    result.kind = 'study';
    result.matchedTask = match;
    result.block = d.block || R.matrix[match]?.block;
    result.avoid = d.avoid;
    result.howto = d.howto;
    result.value = d.value;
    const wtLabel = String(d.workType ?? R.tasks[match]?.workType_raw ?? '');
    if (wtLabel) {
      const code = wtLabel.trim().charAt(0).toUpperCase();
      if (R.workTypes[code]) {
        result.workType = code;
        result.workTypeName = R.workTypes[code].name;
      }
    }
    const codes = String(d.methods ?? '')
      .split(/[,/]/)
      .map(s => s.trim())
      .filter(s => /^M\d+/i.test(s));
    result.methodCodes = codes;
    return result;
  }

  if (/học|bài|ôn|thi|đọc|viết|toán|lý|hoá|hóa|văn|anh|code|lập trình|làm việc|họp|dự án|email|nghiên cứu/.test(t)) {
    result.kind = 'study';
  }
  return result;
}

function mealLine(goalKey: string, mealTime?: 'sang' | 'trua' | 'toi'): string {
  const goal = findBest(R.mealsByGoal, goalKey) ?? goalKey;
  const list = R.mealsByGoal[goal] ?? [];
  const label: Record<string, string> = { sang: 'sáng', trua: 'trưa', toi: 'tối' };
  const filtered = mealTime
    ? list.filter(m => norm(m.meal).includes(label[mealTime]))
    : list;
  const pool = (filtered.length ? filtered : list).slice(0, 6);
  return pool
    .map(m => `${m.dish} (${m.portion}${m.kcal ? `, ${m.kcal}kcal` : ''}${m.protein ? `, ${m.protein}g đạm` : ''})`)
    .join('; ');
}

function exerciseLine(goalKey: string): string {
  const goal = findBest(R.exercisesByGoal, goalKey) ?? goalKey;
  const list = R.exercisesByGoal[goal] ?? [];
  return list
    .slice(0, 6)
    .map(e => `${e.exercise} — ${e.dose}${e.place ? ` (${e.place})` : ''}`)
    .join('; ');
}

export function resolveGoalKey(p: ProfileResolution): string {
  if (p.mealGoal && p.mealGoal !== 'Theo chuyên gia' && p.mealGoal !== '-') return p.mealGoal;
  if (p.need) return { gain: 'Tăng cân', lose: 'Giảm cân', muscle: 'Tăng cơ' }[p.need];
  return 'Duy trì cân nặng';
}

export function mealItemLines(goalKey: string, mealTime?: 'sang' | 'trua' | 'toi', count = 3): string[] {
  const goal = findBest(R.mealsByGoal, goalKey) ?? goalKey;
  const list = R.mealsByGoal[goal] ?? [];
  const label: Record<string, string> = { sang: 'sáng', trua: 'trưa', toi: 'tối' };
  const filtered = mealTime ? list.filter(m => norm(m.meal).includes(label[mealTime])) : list;
  const pool = (filtered.length ? filtered : list).slice(0, count);
  return pool.map(
    m => `${m.dish} (${m.portion}${m.kcal ? `, ${m.kcal}kcal` : ''}${m.protein ? `, ${m.protein}g đạm` : ''})`
  );
}

export function exerciseItemLines(goalKey: string, count = 3): string[] {
  const goal = findBest(R.exercisesByGoal, goalKey) ?? goalKey;
  const list = R.exercisesByGoal[goal] ?? [];
  return list
    .slice(0, count)
    .map(e => `${e.exercise} — ${e.dose}${e.place ? ` (${e.place})` : ''}`);
}

export function methodLabel(code: string): string | undefined {
  const m = R.methods[code];
  return m ? `${code} ${clean(m.name)}` : undefined;
}

function windowFrom(value: unknown): [string, string] | undefined {
  const m = String(value ?? '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  return m ? [m[1], m[2]] : undefined;
}

export function mealWindowFrom(row: Map2, key: 'sang' | 'trua' | 'toi'): [string, string] | undefined {
  return windowFrom(row?.meals?.[key]);
}

export function blockWindowFrom(row: Map2, key: string): [string, string] | undefined {
  return windowFrom(row?.blocks?.[key]);
}

export function healthAdvice(p: ProfileResolution, max = 3): string[] {
  const tips: string[] = [];
  for (const hk of p.healthMatches) {
    const h = R.health[hk];
    if (h.avoid) tips.push(`Tránh: ${clean(h.avoid, 120)}`);
    if (h.activityGood) tips.push(`Nên vận động: ${clean(h.activityGood, 120)}`);
  }
  for (const mk of p.mentalMatches) {
    const m = R.mental[mk];
    if (m.rules) tips.push(clean(m.rules, 140));
    if (m.avoid) tips.push(`Tránh: ${clean(m.avoid, 120)}`);
  }
  return tips.slice(0, max);
}

export function buildRuleContext(input: RetrieveInput): string {
  const p = resolveProfile(input.profile);
  const row = p.row as Map2;
  const lines: string[] = [];

  lines.push(`HỒ SƠ NGHỀ: ${p.profileId} — ${clean(row.name || p.matchedJob || 'mặc định')}`);
  lines.push(
    `- Giờ thức ${clean(row.wake)} | Giờ ngủ ${clean(row.sleep)} | Tập trung sâu tối đa/ngày: ${clean(row.deepFocusMax)}`
  );
  const blocks = row.blocks ?? {};
  lines.push(
    `- Khối cao điểm: D1 ${clean(blocks.D1)} | D2 ${clean(blocks.D2)} | Trũng ${clean(blocks.TR)} | Vận động ${clean(blocks.VD)} | Tối nhẹ ${clean(blocks.TOI)} | Trước ngủ ${clean(blocks.NGU)}`
  );
  const meals = row.meals ?? {};
  lines.push(
    `- Bữa cố định: sáng ${clean(meals.sang)} | trưa ${clean(meals.trua)} | tối ${clean(meals.toi)} | phụ ${clean(meals.phu)}`
  );
  if (row.constraints) lines.push(`- Ràng buộc: ${clean(row.constraints)}`);
  if (row.note) lines.push(`- Lưu ý riêng: ${clean(row.note)}`);
  lines.push(
    `- GIỚI HẠN ÁP DỤNG (đã lấy min): hệ số tải ${p.loadFactor} | phiên tập trung tối đa ${p.maxSessionMin} phút | nguồn: ${p.appliedFactors.join(', ') || 'mặc định'}`
  );

  for (const hk of p.healthMatches) {
    const h = R.health[hk];
    lines.push(`SỨC KHỎE — ${hk}:`);
    if (h.rules) lines.push(`  • Quy tắc lịch: ${clean(h.rules, 260)}`);
    if (h.avoid) lines.push(`  • Giờ nên tránh: ${clean(h.avoid)}`);
    if (h.mealGoal && h.mealGoal !== '-') lines.push(`  • Mục tiêu ăn: ${clean(h.mealGoal)}`);
    if (h.foodPriority) lines.push(`  • Nhóm món ưu tiên: ${clean(h.foodPriority)}`);
    if (h.foodAvoid) lines.push(`  • Nhóm món hạn chế: ${clean(h.foodAvoid)}`);
    if (h.exGoal && h.exGoal !== '-') lines.push(`  • Mục tiêu tập: ${clean(h.exGoal)} | Mức tối đa: ${clean(h.exMax)}`);
    if (h.exAvoid) lines.push(`  • Bài tập nên tránh: ${clean(h.exAvoid)}`);
    if (h.activityGood) lines.push(`  • Giờ vận động tốt: ${clean(h.activityGood)}`);
    if (h.doctor && norm(h.doctor) !== 'không') lines.push(`  • Cần hỏi bác sĩ: ${clean(h.doctor)}`);
  }

  for (const mk of p.mentalMatches) {
    const m = R.mental[mk];
    lines.push(`TINH THẦN — ${mk}:`);
    if (m.rules) lines.push(`  • Quy tắc lịch: ${clean(m.rules, 260)}`);
    if (m.priorityBlock) lines.push(`  • Khối giờ ưu tiên: ${clean(m.priorityBlock)}`);
    if (m.avoid) lines.push(`  • Nên tránh: ${clean(m.avoid)}`);
    if (m.methods) lines.push(`  • Phương pháp nên dùng (mã): ${clean(m.methods)}`);
    if (m.exercise) lines.push(`  • Vận động hỗ trợ: ${clean(m.exercise)}`);
    if (m.food) lines.push(`  • Món/đồ uống hỗ trợ: ${clean(m.food)}`);
  }

  const classes = (input.schedule ?? []).map(s => classifyBlock(s.title, s.time, s.tasks));
  if (classes.length) {
    lines.push('PHÂN LOẠI KHỐI LỊCH HIỆN CÓ:');
    for (const c of classes) {
      if (c.kind === 'study' && c.matchedTask) {
        const parts = [
          `"${c.title}" [${c.time}] → việc loại ${c.workType ?? '?'} (${clean(c.workTypeName)}) khối ${c.block ?? '?'}`,
        ];
        if (c.howto) parts.push(`cách làm: ${clean(c.howto, 160)}`);
        if (c.avoid) parts.push(`tránh: ${clean(c.avoid)}`);
        lines.push(`- ${parts.join(' | ')}`);
      } else if (c.kind === 'study') {
        lines.push(`- "${c.title}" [${c.time}] → hoạt động học/làm việc (chia phiên theo giới hạn trên, tránh khối trũng 13:00-14:30)`);
      } else {
        const label: Record<BlockKind, string> = {
          eating: 'bữa ăn (giữ cố định, thêm gợi ý món)',
          exercise: 'vận động (theo mục tiêu tập)',
          rest: 'nghỉ ngơi/ngủ (giữ cố định)',
          other: 'khác',
          study: 'học/làm việc',
        };
        lines.push(`- "${c.title}" [${c.time}] → ${label[c.kind]}`);
      }
    }
  }

  const goal = p.mealGoal && p.mealGoal !== 'Theo chuyên gia' ? p.mealGoal : p.need ? { gain: 'Tăng cân', lose: 'Giảm cân', muscle: 'Tăng cơ' }[p.need] : 'Duy trì cân nặng';
  const mealSang = mealLine(goal, 'sang');
  const mealTrua = mealLine(goal, 'trua');
  const mealToi = mealLine(goal, 'toi');
  lines.push(`GỢI Ý MÓN (mục tiêu ${goal}):`);
  if (mealSang) lines.push(`- Bữa sáng: ${mealSang}`);
  if (mealTrua) lines.push(`- Bữa trưa: ${mealTrua}`);
  if (mealToi) lines.push(`- Bữa tối: ${mealToi}`);

  const exGoal = p.exerciseGoals[0] ?? 'Sức bền - tim phổi';
  const exLine = exerciseLine(exGoal);
  if (exLine) lines.push(`GỢI Ý BÀI TẬP (mục tiêu ${exGoal}): ${exLine}`);

  const methodCodes = new Set<string>();
  for (const c of classes) for (const code of c.methodCodes) methodCodes.add(code);
  for (const mk of p.mentalMatches) {
    for (const code of String(R.mental[mk].methods ?? '').split(/[,/]/)) {
      const m = code.trim();
      if (/^M\d+/i.test(m)) methodCodes.add(m);
    }
  }
  const methodLines: string[] = [];
  for (const code of methodCodes) {
    const m = R.methods[code];
    if (m) methodLines.push(`- ${code} ${clean(m.name)}: ${clean(m.steps, 180)}`);
  }
  if (methodLines.length) lines.push('PHƯƠNG PHÁP (áp dụng cho khối học/làm việc):');
  lines.push(...methodLines);

  return lines.join('\n');
}
