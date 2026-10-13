import type {
  AchievementIdea,
  BlockAnalysis,
  PlanAnalysis,
  PlanOption,
  PlanResult,
} from '../../../shared/ai';

export const AI_PLAN_DELAY = 4500;
export const AI_BLOCK_DELAY = 2200;
export const AI_DAILY_DELAY = 1500;

const TIME_OPTIONS = ['05:30 - 06:00', '06:00 - 06:30', '07:00 - 11:00'];

function analysis(overrides: Partial<PlanAnalysis> = {}): PlanAnalysis {
  return {
    timeOptions: TIME_OPTIONS,
    suggestions: [],
    healthTips: [],
    why: '',
    ...overrides,
  };
}

const WAKE = analysis({
  suggestions: ['Uống một cốc nước ấm', 'Hít thở sâu và vươn vai 2 phút'],
  healthTips: ['Mở cửa sổ cho thoáng phòng'],
  why: 'Dậy sớm giúp cơ thể tỉnh táo và có nhiều thời gian cho buổi sáng.',
});

const BREAKFAST = analysis({
  need: 'gain',
  suggestions: ['Phở bò 1 tô', 'Trứng ốp la 2 quả', 'Sữa ấm 200ml'],
  healthTips: ['Ăn chậm, nhai kỹ'],
  why: 'Bữa sáng đủ chất đặt nền cho năng lượng cả ngày.',
});

const SCHOOL = analysis({
  method: 'Học theo Pomodoro 45 phút học - 10 phút nghỉ',
  healthTips: ['Ngồi thẳng lưng', 'Nhìn xa 20 giây mỗi 20 phút'],
  why: 'Buổi sáng là khoảng thời gian tập trung cao nhất cho việc học.',
});

const LUNCH_NAP = analysis({
  suggestions: ['Ngủ trưa 20 phút', 'Không dùng điện thoại trước khi ngủ'],
  healthTips: ['Không ngủ quá 30 phút để tránh mệt'],
  why: 'Nghỉ trưa giúp hồi phục năng lượng cho buổi chiều.',
});

const STUDY = analysis({
  method: 'Ôn tập chủ động bằng flashcard',
  healthTips: ['Nghỉ mắt mỗi 25 phút'],
  why: 'Buổi chiều thích hợp cho việc ôn lại kiến thức.',
});

function planBlocks() {
  return [
    { title: 'Dậy sớm', type: 'other' as const, start: '05:30', end: '06:00', tasks: [], analysis: WAKE },
    { title: 'Ăn sáng', type: 'eating' as const, start: '06:00', end: '06:30', tasks: [], analysis: BREAKFAST },
    { title: 'Đi học', type: 'study' as const, start: '07:00', end: '11:00', tasks: ['Ghi chép bài'], analysis: SCHOOL },
    { title: 'Nghỉ trưa', type: 'other' as const, start: '11:30', end: '13:00', tasks: [], analysis: LUNCH_NAP },
    { title: 'Tự học', type: 'study' as const, start: '14:00', end: '16:00', tasks: [], analysis: STUDY },
  ];
}

function option(id: string, name: string, description: string, shift: number): PlanOption {
  const blocks = planBlocks().map(block => {
    if (shift === 0) return block;
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m + shift;
    };
    const fmt = (min: number) => {
      const clamped = Math.max(0, Math.min(23 * 60 + 59, min));
      return `${Math.floor(clamped / 60)}:${String(clamped % 60).padStart(2, '0')}`;
    };
    return { ...block, start: fmt(toMin(block.start)), end: fmt(toMin(block.end)) };
  });
  return { id, name, description, blocks };
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

export function tutorialPlanSchedule(): Promise<PlanResult> {
  return delay(
    {
      options: [
        option('opt-1', 'Lịch khoa học', 'Sắp xếp các hoạt động theo nhịp sinh học, ưu tiên buổi sáng.', 0),
        option('opt-2', 'Lịch thư giãn', 'Dịch chuyển nhẹ các khối để có thêm thời gian nghỉ ngơi.', 30),
      ],
    },
    AI_PLAN_DELAY,
  );
}

export function tutorialBlockAnalysis(): Promise<BlockAnalysis> {
  return delay(
    {
      need: 'gain',
      timeOptions: TIME_OPTIONS,
      suggestions: ['Ức gà 150g', 'Gạo lứt 100g', 'Rau xanh 200g'],
      method: 'Học theo Pomodoro 45/10',
      healthTips: ['Ngồi thẳng lưng', 'Nghỉ mắt định kỳ'],
      why: 'Khung giờ này phù hợp để cơ thể tiếp nhận và tập trung tốt nhất.',
    },
    AI_BLOCK_DELAY,
  );
}

export function tutorialDailyInsight(): Promise<string> {
  return delay(
    'Hôm nay bạn có một lịch khá cân bằng giữa học tập và nghỉ ngơi. Hãy giữ đúng giờ khối "Đi học" để duy trì đà tập trung, và đừng quên uống đủ nước nhé!',
    AI_DAILY_DELAY,
  );
}

export function tutorialAchievements(): Promise<AchievementIdea[]> {
  return delay(
    [
      {
        title: 'Chiến thần dậy sớm',
        description: 'Duy trì thói quen thức dậy đúng giờ mỗi sáng.',
        reason: 'Gắn với khối "Dậy sớm" trong lịch mới của bạn.',
        target: 30,
        unit: 'buổi',
        emoji: '🌅',
      },
      {
        title: 'Cỗ máy tập trung',
        description: 'Hoàn thành các phiên học tập trung không xao nhãng.',
        reason: 'Gắn với khối "Đi học" và "Tự học".',
        target: 50,
        unit: 'phiên',
        emoji: '🎯',
      },
    ],
    AI_BLOCK_DELAY,
  );
}
