import { days, type ScheduleBlock } from '../hooks/scheduleData';
import { getAccountItem, setAccountItem, refreshStores } from '../hooks/accountStorage';

const WEEKDAY_KEY = 'daytrack_weekday_schedules';
const CALENDAR_KEY = 'daytrack_calendar_schedules';
const AI_DAYS_KEY = 'daytrack_calendar_ai_days';
const BUSY_KEY = 'daytrack_busy_hours';
const TASKS_KEY = 'daytrack_tasks';
const ACHIEVEMENTS_KEY = 'daytrack_achievements';

const DATA_REFRESH_EVENT = 'daytrack:data-refresh';

const SEED_KEYS = [
  WEEKDAY_KEY,
  CALENDAR_KEY,
  AI_DAYS_KEY,
  BUSY_KEY,
  TASKS_KEY,
  ACHIEVEMENTS_KEY,
];

let snapshot: Record<string, string | null> | null = null;

function todayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function todayDay(): string {
  return days[todayIndex()];
}

function todayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function sampleWeekdaySchedules(): Record<string, ScheduleBlock[]> {
  const day = todayDay();
  return {
    [day]: [
      { id: 'tour-wake', title: 'Dậy sớm', time: '05:30 - 06:00', color: 'bg-yellow-400', tasks: [] },
      { id: 'tour-breakfast', title: 'Ăn sáng', time: '06:00 - 06:30', color: 'bg-orange-400', tasks: [] },
      {
        id: 'tour-school',
        title: 'Đi học',
        time: '07:00 - 11:00',
        color: 'bg-blue-400',
        tasks: [{ id: 'tour-school-task', title: 'Ghi chép bài', priority: 'high' }],
      },
    ],
  };
}

function sampleCalendar(): Record<string, ScheduleBlock[]> {
  return {
    [todayDateKey()]: [
      { id: 'tour-group', title: 'Học nhóm', time: '14:00 - 16:00', color: 'bg-purple-400', tasks: [] },
    ],
  };
}

function sampleTasks() {
  const weekday = todayIndex();
  return [
    { id: 'tour-task-wake', title: 'Dậy sớm', priority: 'high', completed: false, weekday },
    { id: 'tour-task-breakfast', title: 'Ăn sáng', priority: 'medium', completed: false, weekday },
    { id: 'tour-task-school', title: 'Đi học', priority: 'high', completed: false, weekday },
    { id: 'tour-task-water', title: 'Uống đủ nước', priority: 'low', completed: false, recurrence: 'daily' },
  ];
}

function sampleValues(): Record<string, string> {
  return {
    [WEEKDAY_KEY]: JSON.stringify(sampleWeekdaySchedules()),
    [CALENDAR_KEY]: JSON.stringify(sampleCalendar()),
    [AI_DAYS_KEY]: JSON.stringify([]),
    [BUSY_KEY]: JSON.stringify({}),
    [TASKS_KEY]: JSON.stringify(sampleTasks()),
    [ACHIEVEMENTS_KEY]: JSON.stringify([]),
  };
}

function blankValue(key: string): string {
  if (key === TASKS_KEY || key === AI_DAYS_KEY || key === ACHIEVEMENTS_KEY) return '[]';
  return '{}';
}

export function refreshTutorialData(): void {
  refreshStores();
  try {
    window.dispatchEvent(new CustomEvent(DATA_REFRESH_EVENT));
  } catch {
    // ignore environments without window
  }
}

export function seedTutorialData(): void {
  if (snapshot) return;
  snapshot = {};
  for (const key of SEED_KEYS) {
    snapshot[key] = getAccountItem(key);
  }
  const values = sampleValues();
  for (const key of SEED_KEYS) {
    setAccountItem(key, values[key]);
  }
  refreshTutorialData();
}

export function restoreTutorialData(): void {
  if (!snapshot) return;
  for (const key of SEED_KEYS) {
    const original = snapshot[key];
    if (original !== null) setAccountItem(key, original);
    else setAccountItem(key, blankValue(key));
  }
  snapshot = null;
  refreshTutorialData();
}

export function clearTutorialDataIfActive(): void {
  if (snapshot) restoreTutorialData();
}
