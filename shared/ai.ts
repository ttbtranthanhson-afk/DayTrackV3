export interface ScheduleItem {
  title: string;
  time: string;
  tasks?: string[];
}

export interface AnalyzeScheduleInput {
  day: string;
  schedule: ScheduleItem[];
  busy: string[];
}

export interface SuggestBlockInput {
  day?: string;
  title: string;
  time: string;
  tasks?: string[];
}

export interface DailyInsightInput {
  day: string;
  schedule: ScheduleItem[];
}

export type BlockType = 'eating' | 'study' | 'exercise' | 'other';
export type Need = 'gain' | 'lose' | 'muscle';

export interface PlanAnalysis {
  need?: Need;
  timeOptions: string[];
  suggestions: string[];
  method?: string;
  healthTips: string[];
  why: string;
}

export interface PlannedBlock {
  title: string;
  type: BlockType;
  start: string;
  end: string;
  tasks: string[];
  analysis: PlanAnalysis;
}

export interface PlanOption {
  id: string;
  name: string;
  description?: string;
  blocks: PlannedBlock[];
}

export interface PlanResult {
  options: PlanOption[];
}

export interface PlanInput {
  day: string;
  schedule: ScheduleItem[];
  busy: string[];
  profile?: {
    job?: string;
    health?: string;
    mental?: string;
  };
  ruleContext?: string;
}

export interface BlockAnalysisInput {
  day: string;
  title: string;
  type: BlockType;
  time: string;
  need?: Need;
  tasks?: string[];
}

export interface BlockAnalysis {
  need?: Need;
  timeOptions: string[];
  suggestions: string[];
  method?: string;
  healthTips: string[];
  why: string;
}

export interface AchievementIdea {
  title: string;
  description: string;
  reason: string;
  target: number;
  unit: string;
  emoji: string;
}

export interface AchievementsInput {
  day: string;
  scheduleName: string;
  blocks: { title: string; type: BlockType; tasks: string[] }[];
}

export interface AiSuggestion {
  title: string;
  sections: AiSection[];
  note?: string;
}

export interface AiSection {
  heading: string;
  items: string[];
}

export type AiAction = 'analyze' | 'suggest' | 'daily' | 'plan' | 'block' | 'achievements';

export interface BuiltPrompt {
  prompt: string;
  system: string;
  json: boolean;
  temperature: number;
}

export const SYSTEM_PROMPT =
  'Bạn là trợ lý quản lý thời gian cho ứng dụng lịch trình cá nhân. ' +
  'Luôn trả lời ngắn gọn, thực tế, thân thiện, bằng tiếng Việt và tuân thủ nghiêm ngặt mọi quy tắc trong yêu cầu. ' +
  'Không suy luận dài dòng, chỉ trả về đúng kết quả được yêu cầu.';

const DEFAULT_TIME_OPTIONS = ['16:00 - 17:00', '16:30 - 17:30', '17:00 - 18:00'];
const BLOCK_TYPES: BlockType[] = ['eating', 'study', 'exercise', 'other'];

function scheduleLines(schedule: ScheduleItem[]): string {
  return schedule.length
    ? schedule
        .map(s => `- ${s.time}: ${s.title}${s.tasks?.length ? ` (nhiệm vụ: ${s.tasks.join(', ')})` : ''}`)
        .join('\n')
    : 'Chưa có lịch nào trong ngày.';
}

function buildAnalyzePrompt(input: AnalyzeScheduleInput): BuiltPrompt {
  const busyText = input.busy.length ? input.busy.join(', ') : 'Không có';

  return {
    system: SYSTEM_PROMPT,
    json: false,
    temperature: 0.8,
    prompt: [
      `Ngày: ${input.day}`,
      'Lịch trình hiện có:',
      scheduleLines(input.schedule),
      `Khung giờ bận: ${busyText}`,
      '',
      'Hãy phân tích ngắn gọn lịch trình trên và đưa ra gợi ý sắp xếp khoa học, tập trung vào sức khỏe và thời điểm phù hợp.',
      'Không đề xuất thêm lịch làm việc mới; chỉ sắp xếp lại các khối sẵn có, có thể nhắc thêm bữa ăn/nghỉ ngơi nếu cần.',
      'Yêu cầu: trả lời bằng tiếng Việt, tối đa 8 dòng, mỗi ý bắt đầu bằng "• ", không dùng markdown heading,',
      'chỉ nêu nhận xét và gợi ý cụ thể dựa trên dữ liệu trên. Nếu thiếu dữ liệu thì gợi ý chung cho một ngày hiệu quả.',
    ].join('\n'),
  };
}

function buildSuggestPrompt(input: SuggestBlockInput): BuiltPrompt {
  return {
    system: SYSTEM_PROMPT,
    json: true,
    temperature: 0.9,
    prompt: [
      `Ngày: ${input.day || 'không rõ'}`,
      `Khối lịch: "${input.title}"`,
      `Thời gian: ${input.time}`,
      `Nhiệm vụ trong khối: ${input.tasks?.length ? input.tasks.join(', ') : 'Không có'}`,
      '',
      'Hãy đưa ra gợi ý cách THỰC HIỆN khối lịch này dựa trên loại hoạt động (ăn uống, học tập, thể dục, nghỉ ngơi...).',
      'Không đề xuất thêm nhiệm vụ mới, không thay đổi lịch trình; chỉ hướng dẫn cách làm.',
      'Trả về DUY NHẤT một đối tượng JSON theo đúng cấu trúc sau:',
      '{"title": "tiêu đề ngắn", "sections": [{"heading": "tên mục", "items": ["ý 1", "ý 2", "ý 3"]}], "note": "một câu giải thích ngắn"}',
      'Yêu cầu: 2 đến 4 mục, mỗi mục 2 đến 4 ý; nội dung tiếng Việt, cụ thể (thời lượng, số lần, món ăn/bài tập...); không dùng markdown.',
    ].join('\n'),
  };
}

function buildDailyPrompt(input: DailyInsightInput): BuiltPrompt {
  return {
    system: SYSTEM_PROMPT,
    json: false,
    temperature: 0.8,
    prompt: [
      `Ngày: ${input.day}`,
      'Lịch trình hôm nay:',
      scheduleLines(input.schedule),
      '',
      'Hãy đưa ra một nhận xét ngắn (tối đa 3 câu) về lịch của tôi trong hôm nay kèm một gợi ý cải thiện. Bằng tiếng Việt, súc tích.',
    ].join('\n'),
  };
}

function buildPlanPrompt(input: PlanInput): BuiltPrompt {
  const busyText = input.busy.length ? input.busy.join(', ') : 'Không có';

  return {
    system: SYSTEM_PROMPT,
    json: true,
    temperature: 0.85,
    prompt: [
      'Bạn là chuyên gia sắp xếp thời gian cho MỘT ngày của người dùng.',
      'Mục tiêu: sắp xếp lại GIỜ của các khối lịch SẴN CÓ sao cho hợp sức khỏe và đúng thời điểm phù hợp nhất để thực hiện hoạt động đó.',
      '',
      'QUY TẮC BẮT BUỘC (vi phạm là sai):',
      '- Giữ NGUYÊN mọi khối lịch gốc: giữ đúng "title", không xóa, không đổi tên, không gộp hay tách khối.',
      '- KHÔNG tự ý thêm nhiệm vụ. Khối gốc không có nhiệm vụ thì "tasks": []; khối gốc có nhiệm vụ thì giữ nguyên đúng danh sách nhiệm vụ đó.',
      '- KHÔNG thêm khối lịch làm việc/học tập/thể dục mới.',
      '- CHỈ được phép thêm khối MỚI loại ăn uống ("eating") hoặc nghỉ ngơi (type "other", tiêu đề bắt đầu bằng "Nghỉ") khi thật cần thiết, tối đa 2 khối mới cho mỗi phương án.',
      '- KHÔNG bịa thêm lịch khác dưới mọi hình thức.',
      '- Chỉ được đổi "start"/"end" của các khối (định dạng "HH:MM", 24 giờ), trong khoảng 05:00-23:00, không chồng lấn nhau và không nằm trong khung giờ bận.',
      '- Tạo ĐÚNG 2 phương án sắp xếp KHÁC NHAU để người dùng chọn.',
      '',
      `Ngày: ${input.day}`,
      'Khối lịch hiện có:',
      scheduleLines(input.schedule),
      `Khung giờ bận (không được xếp vào): ${busyText}`,
      ...(input.ruleContext
        ? [
            '',
            '===== BỘ QUY TẮC DAYTRACK (BẮT BUỘC TUÂN THỦ) =====',
            input.ruleContext,
            '===== HẾT BỘ QUY TẮC =====',
            'Áp dụng nghiêm các quy tắc trên: giới hạn phiên, khối giờ, giờ nên tránh, mục tiêu ăn/tập, phương pháp.',
            'Nội dung "suggestions" của bữa ăn/bài tập PHẢI lấy từ danh sách gợi ý trong bộ quy tắc (kèm khối lượng/liều tập).',
          ]
        : []),
      '',
      'Trả về DUY NHẤT JSON theo cấu trúc:',
      '{"options":[{"id":"opt-1","name":"tên phương án ngắn","description":"mô tả ngắn","blocks":[{"title":"...","type":"study","start":"08:00","end":"09:30","tasks":[],"analysis":{"need":"muscle","timeOptions":["16:00 - 17:00","16:30 - 17:30","17:00 - 18:00"],"suggestions":["Ức gà 150g","Gạo lứt 100g"],"method":"phương pháp học","healthTips":["ngồi thẳng lưng"],"why":"vì sao xếp như vậy"}}]}]}',
      'Phân tích "analysis" phải điền cho MỌI khối (kể cả khối giữ nguyên giờ) để lưu sẵn cho mục Hôm nay:',
      '- "timeOptions": luôn gồm 3 khung giờ hợp lý cho khối đó.',
      '- "why": một câu ngắn vì sao nên thực hiện khối này vào giờ đã xếp.',
      '- type "eating": điền "need" ("gain"|"lose"|"muscle") và "suggestions" là thực đơn kèm khối lượng gram.',
      '- type "exercise": điền "need" và "suggestions" là bài tập kèm số lượng (km, cái, giây).',
      '- type "study": điền "method" (phương pháp học theo môn) và "healthTips" (tư thế, thời gian nghỉ).',
      '- type "other" (nghỉ ngơi): "suggestions" và "healthTips" ngắn gọn, thiết thực, không đề xuất nhiệm vụ.',
      '- Không đề xuất nhiệm vụ mới trong bất kỳ trường nào.',
      '- Tất cả nội dung bằng tiếng Việt, cụ thể, không dùng markdown.',
    ].join('\n'),
  };
}

function buildBlockPrompt(input: BlockAnalysisInput): BuiltPrompt {
  const needText = input.need ? `Nhu cầu của người dùng: ${input.need}.` : 'Nhu cầu: chưa xác định, hãy chọn một nhu cầu hợp lý.';

  return {
    system: SYSTEM_PROMPT,
    json: true,
    temperature: 0.9,
    prompt: [
      'Phân tích cách THỰC HIỆN MỘT khối lịch trình đã có. KHÔNG sắp xếp lại thời gian và KHÔNG thêm nhiệm vụ.',
      `Ngày: ${input.day}`,
      `Tiêu đề: "${input.title}"`,
      `Loại: ${input.type}`,
      `Thời gian hiện tại: ${input.time}`,
      `Nhiệm vụ: ${input.tasks?.length ? input.tasks.join(', ') : 'Không có'}`,
      needText,
      '',
      'Trả về DUY NHẤT JSON theo cấu trúc:',
      '{"need":"gain|lose|muscle","timeOptions":["16:00 - 17:00","16:30 - 17:30","17:00 - 18:00"],"suggestions":["..."],"method":"...","healthTips":["..."],"why":"..."}',
      'Quy tắc theo loại:',
      '- Không đổi tiêu đề, thời gian hay nhiệm vụ. Nếu khối không có nhiệm vụ thì tuyệt đối không đề xuất nhiệm vụ mới.',
      '- "eating": "suggestions" là thực đơn gợi ý kèm khối lượng gram, dựa theo nhu cầu (gain/lose/muscle); "why" giải thích dinh dưỡng.',
      '- "exercise": "suggestions" là các bài tập kèm số lượng (km, cái, giây) theo nhu cầu; "why" giải thích vì sao tập như thế.',
      '- "study": "method" là phương pháp học phù hợp môn học; "healthTips" gồm tư thế, thời gian học và thời gian thư giãn; "why" giải thích.',
      '- "other": "suggestions" và "healthTips" ngắn gọn, thiết thực.',
      '- "timeOptions" gồm 3 khung giờ hợp lý chỉ để tham khảo.',
      '- Nội dung tiếng Việt, cụ thể, không markdown.',
    ].join('\n'),
  };
}

function buildAchievementsPrompt(input: AchievementsInput): BuiltPrompt {
  const blockLines = input.blocks.length
    ? input.blocks.map(b => `- ${b.title} (${b.type})${b.tasks.length ? `: ${b.tasks.join(', ')}` : ''}`).join('\n')
    : 'Không có.';

  return {
    system: SYSTEM_PROMPT,
    json: true,
    temperature: 1,
    prompt: [
      'Người dùng vừa lưu một lịch trình và DayTrack muốn tạo mục tiêu thành tựu từ đó.',
      `Ngày: ${input.day}`,
      `Tên lịch trình: "${input.scheduleName}"`,
      'Các khối và nhiệm vụ:',
      blockLines,
      '',
      'Hãy tạo 2 đến 3 thành tựu (mục tiêu) số hoá được, có thể đếm và xác nhận được, phù hợp để tăng tiến độ mỗi khi người dùng hoàn thành nhiệm vụ liên quan.',
      'Tên thành tựu phải NGẦU, trẻ trung, dễ nhớ, hấp dẫn (kiểu game).',
      'Trả về DUY NHẤT JSON:',
      '{"achievements":[{"title":"Chiến thần giải toán","description":"mô tả ngắn","reason":"lý do gắn với lịch","target":100,"unit":"bài toán","emoji":"🔥"}]}',
      'Quy tắc: target là số nguyên dương hợp lý (20-500), unit là đơn vị đếm (bài toán, km, hiệp, buổi...), emoji là 1 ký tự.',
      'Tuyệt đối không trùng tên với nhau, đa dạng chủ đề.',
    ].join('\n'),
  };
}

export function isAiAction(value: unknown): value is AiAction {
  return (
    value === 'analyze' ||
    value === 'suggest' ||
    value === 'daily' ||
    value === 'plan' ||
    value === 'block' ||
    value === 'achievements'
  );
}

export function buildPrompt(action: AiAction, input: unknown): BuiltPrompt {
  switch (action) {
    case 'analyze':
      return buildAnalyzePrompt(input as AnalyzeScheduleInput);
    case 'suggest':
      return buildSuggestPrompt(input as SuggestBlockInput);
    case 'daily':
      return buildDailyPrompt(input as DailyInsightInput);
    case 'plan':
      return buildPlanPrompt(input as PlanInput);
    case 'block':
      return buildBlockPrompt(input as BlockAnalysisInput);
    case 'achievements':
      return buildAchievementsPrompt(input as AchievementsInput);
    default:
      throw new Error(`Hành động không hợp lệ: ${String(action)}`);
  }
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string').join('; ');
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function asStringArray(value: unknown, max = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string').slice(0, max);
}

function splitInline(text: string): string[] {
  return text
    .split(/[\n\r•·|;]+/)
    .map(part => part.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean);
}

function toList(value: unknown, max = 8): string[] {
  const rawItems = Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : typeof value === 'string'
      ? [value]
      : [];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of rawItems) {
    const parts = /[\n\r•·|;]/.test(item) ? splitInline(item) : [item.trim()];
    for (const part of parts) {
      const clean = part.replace(/\s+/g, ' ').trim();
      if (!clean) continue;
      const key = clean.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(clean);
      if (out.length >= max) return out;
    }
  }
  return out;
}

function normalizeType(value: unknown): BlockType {
  return BLOCK_TYPES.includes(value as BlockType) ? (value as BlockType) : 'other';
}

function normalizeNeed(value: unknown): Need | undefined {
  return value === 'gain' || value === 'lose' || value === 'muscle' ? value : undefined;
}

function normalizeAnalysis(value: unknown): PlanAnalysis {
  const raw = (value ?? {}) as Partial<PlanAnalysis>;
  const timeOptions = toList(raw.timeOptions, 4);
  return {
    need: normalizeNeed(raw.need),
    timeOptions: timeOptions.length ? timeOptions : DEFAULT_TIME_OPTIONS,
    suggestions: toList(raw.suggestions, 10),
    method: asString(raw.method) || undefined,
    healthTips: toList(raw.healthTips, 6),
    why: asString(raw.why),
  };
}

export function normalizeSuggestion(value: unknown): AiSuggestion {
  const raw = (value ?? {}) as Partial<AiSuggestion>;
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'Gợi ý AI';
  const sections = Array.isArray(raw.sections)
    ? raw.sections
        .filter(s => s && typeof s.heading === 'string' && Array.isArray(s.items))
        .slice(0, 4)
        .map(s => ({
          heading: s.heading,
          items: s.items.filter((i): i is string => typeof i === 'string').slice(0, 6),
        }))
    : [];

  return {
    title,
    sections,
    note: typeof raw.note === 'string' ? raw.note : undefined,
  };
}

export function normalizePlan(value: unknown): PlanResult {
  const raw = (value ?? {}) as Partial<PlanResult>;
  const options = Array.isArray(raw.options) ? raw.options : [];

  const normalized: PlanOption[] = options
    .slice(0, 3)
    .map((option, index) => {
      const blocks = Array.isArray(option?.blocks) ? option.blocks : [];
      return {
        id: asString(option?.id) || `opt-${index + 1}`,
        name: asString(option?.name) || `Phương án ${index + 1}`,
        description: asString(option?.description) || undefined,
        blocks: blocks
          .slice(0, 20)
          .map(block => ({
            title: asString(block?.title) || 'Khối lịch',
            type: normalizeType(block?.type),
            start: asString(block?.start) || '08:00',
            end: asString(block?.end) || '09:00',
            tasks: asStringArray(block?.tasks, 12),
            analysis: normalizeAnalysis(block?.analysis),
          }))
          .filter(block => block.title),
      };
    })
    .filter(option => option.blocks.length > 0);

  return { options: normalized };
}

export function normalizeBlockAnalysis(value: unknown): BlockAnalysis {
  const analysis = normalizeAnalysis(value);
  return {
    need: analysis.need,
    timeOptions: analysis.timeOptions,
    suggestions: analysis.suggestions,
    method: analysis.method,
    healthTips: analysis.healthTips,
    why: analysis.why,
  };
}

export function normalizeAchievements(value: unknown): AchievementIdea[] {
  const raw = (value ?? {}) as { achievements?: unknown };
  const list = Array.isArray(raw.achievements) ? raw.achievements : [];

  return list
    .slice(0, 3)
    .map(item => {
      const idea = (item ?? {}) as Partial<AchievementIdea>;
      const target = Number(idea.target);
      return {
        title: asString(idea.title) || 'Mục tiêu mới',
        description: asString(idea.description),
        reason: asString(idea.reason),
        target: Number.isFinite(target) ? Math.min(Math.max(Math.round(target), 1), 100000) : 30,
        unit: asString(idea.unit) || 'lần',
        emoji: asString(idea.emoji) || '🎯',
      };
    })
    .filter(idea => idea.title);
}
