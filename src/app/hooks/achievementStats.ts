import { useSyncExternalStore } from 'react';
import type { BlockType } from '../../../shared/ai';
import { getAccountItem, setAccountItem, onAccountChange } from './accountStorage';

const STORAGE_KEY = 'daytrack_achievement_stats';

export interface AchievementStats {
  visitDates: string[];
  currentStreak: number;
  longestStreak: number;
  focusSeconds: number;
  focusSessions: number;
  longestFocusSeconds: number;
  studySeconds: number;
  studySessions: number;
  studyMorningSeconds: number;
  studyDates: string[];
  tasksCompleted: number;
  schedulesCompleted: number;
  completedBlockIds: string[];
  blockFocusSeconds: Record<string, number>;
}

const DEFAULT_STATS: AchievementStats = {
  visitDates: [],
  currentStreak: 0,
  longestStreak: 0,
  focusSeconds: 0,
  focusSessions: 0,
  longestFocusSeconds: 0,
  studySeconds: 0,
  studySessions: 0,
  studyMorningSeconds: 0,
  studyDates: [],
  tasksCompleted: 0,
  schedulesCompleted: 0,
  completedBlockIds: [],
  blockFocusSeconds: {},
};

export function todayDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

function arr(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [];
}

function normalize(raw: Partial<AchievementStats> | null | undefined): AchievementStats {
  return {
    ...DEFAULT_STATS,
    ...(raw || {}),
    visitDates: arr(raw?.visitDates),
    studyDates: arr(raw?.studyDates),
    completedBlockIds: arr(raw?.completedBlockIds),
    blockFocusSeconds:
      raw?.blockFocusSeconds && typeof raw.blockFocusSeconds === 'object'
        ? Object.fromEntries(
            Object.entries(raw.blockFocusSeconds).filter(([, v]): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0),
          )
        : {},
    currentStreak: num(raw?.currentStreak),
    longestStreak: num(raw?.longestStreak),
    focusSeconds: num(raw?.focusSeconds),
    focusSessions: num(raw?.focusSessions),
    longestFocusSeconds: num(raw?.longestFocusSeconds),
    studySeconds: num(raw?.studySeconds),
    studySessions: num(raw?.studySessions),
    studyMorningSeconds: num(raw?.studyMorningSeconds),
    tasksCompleted: num(raw?.tasksCompleted),
    schedulesCompleted: num(raw?.schedulesCompleted),
  };
}

function load(): AchievementStats {
  try {
    const raw = getAccountItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw) as Partial<AchievementStats>);
  } catch {
    // ignore malformed storage
  }
  return { ...DEFAULT_STATS };
}

let statsState: AchievementStats = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AchievementStats {
  return statsState;
}

function update(patch: Partial<AchievementStats>) {
  statsState = { ...statsState, ...patch };
  setAccountItem(STORAGE_KEY, JSON.stringify(statsState));
  listeners.forEach(listener => listener());
}

onAccountChange(() => {
  statsState = load();
  listeners.forEach(listener => listener());
});

export function useAchievementStats(): AchievementStats {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function getAchievementStats(): AchievementStats {
  return statsState;
}

function dateKeyToTime(key: string): number | null {
  const match = key.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  const time = new Date(+match[1], +match[2] - 1, +match[3]).getTime();
  return Number.isNaN(time) ? null : time;
}

function computeStreaks(dates: string[]): { current: number; longest: number } {
  const times = [...new Set(dates)]
    .map(dateKeyToTime)
    .filter((t): t is number => t !== null)
    .sort((a, b) => a - b);
  if (!times.length) return { current: 0, longest: 0 };

  const DAY = 86400000;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < times.length; i++) {
    if (times[i] - times[i - 1] === DAY) run++;
    else run = 1;
    longest = Math.max(longest, run);
  }

  const set = new Set(times);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  let cursor = set.has(todayTime) ? todayTime : set.has(todayTime - DAY) ? todayTime - DAY : null;
  let current = 0;
  while (cursor !== null && set.has(cursor)) {
    current++;
    cursor -= DAY;
  }
  return { current, longest };
}

export function recordVisit() {
  const today = todayDateKey();
  if (statsState.visitDates.includes(today)) return;
  const visitDates = [...statsState.visitDates, today];
  const { current, longest } = computeStreaks(visitDates);
  update({
    visitDates,
    currentStreak: current,
    longestStreak: Math.max(statsState.longestStreak, longest),
  });
}

export function addFocusProgress(delta: {
  focusSeconds?: number;
  studySeconds?: number;
  studyMorningSeconds?: number;
}) {
  const focus = Math.max(0, Math.round(delta.focusSeconds || 0));
  const study = Math.max(0, Math.round(delta.studySeconds || 0));
  const morning = Math.max(0, Math.round(delta.studyMorningSeconds || 0));
  if (!focus && !study && !morning) return;

  const patch: Partial<AchievementStats> = {
    focusSeconds: statsState.focusSeconds + focus,
    studySeconds: statsState.studySeconds + study,
    studyMorningSeconds: statsState.studyMorningSeconds + morning,
  };
  if (study > 0 && !statsState.studyDates.includes(todayDateKey())) {
    patch.studyDates = [...statsState.studyDates, todayDateKey()];
  }
  update(patch);
}

export function addFocusSession(seconds: number, study: boolean) {
  const secs = Math.max(0, Math.round(seconds));
  if (secs <= 0) return;
  const patch: Partial<AchievementStats> = {
    focusSessions: statsState.focusSessions + 1,
    longestFocusSeconds: Math.max(statsState.longestFocusSeconds, secs),
  };
  if (study) patch.studySessions = statsState.studySessions + 1;
  update(patch);
}

export interface StatsTask {
  completed: boolean;
  completedDate?: string;
  recurrence?: string;
  scheduleName?: string;
  scheduleBlockId?: string;
  blockType?: BlockType;
}

export function isTaskDone(task: StatsTask): boolean {
  return task.recurrence === 'daily' ? task.completedDate === todayDateKey() : task.completed;
}

function countDone(tasks: StatsTask[]): number {
  return tasks.reduce((n, task) => n + (isTaskDone(task) ? 1 : 0), 0);
}

function completedBlockKeys(tasks: StatsTask[]): Set<string> {
  const groups = new Map<string, { total: number; done: number }>();
  for (const task of tasks) {
    const key = task.scheduleBlockId || (task.scheduleName ? `name:${task.scheduleName}` : undefined);
    if (!key) continue;
    const group = groups.get(key) || { total: 0, done: 0 };
    group.total++;
    if (isTaskDone(task)) group.done++;
    groups.set(key, group);
  }
  const done = new Set<string>();
  for (const [key, group] of groups) {
    if (group.total > 0 && group.done >= group.total) done.add(key);
  }
  return done;
}

function sameSet(a: Set<string>, b: string[]): boolean {
  if (a.size !== b.length) return false;
  for (const value of b) if (!a.has(value)) return false;
  return true;
}

export function syncAchievementStats(prev: StatsTask[], next: StatsTask[]) {
  const delta = countDone(next) - countDone(prev);
  const completed = completedBlockKeys(next);

  const patch: Partial<AchievementStats> = {};
  let changed = false;

  if (delta !== 0) {
    patch.tasksCompleted = Math.max(0, statsState.tasksCompleted + delta);
    changed = true;
  }
  if (!sameSet(completed, statsState.completedBlockIds)) {
    const before = new Set(statsState.completedBlockIds);
    const added = [...completed].filter(key => !before.has(key)).length;
    const removed = [...before].filter(key => !completed.has(key)).length;
    patch.completedBlockIds = [...completed];
    patch.schedulesCompleted = Math.max(0, statsState.schedulesCompleted + added - removed);
    changed = true;
  }

  if (changed) update(patch);
}

export function addFocusToBlock(entries: Array<{ id: string; durationSeconds: number }>, seconds: number) {
  if (!entries.length || seconds <= 0) return;
  const blockFocusSeconds = { ...statsState.blockFocusSeconds };
  let completed = 0;
  for (const entry of entries) {
    if (!entry.id || entry.durationSeconds <= 0) continue;
    const current = (blockFocusSeconds[entry.id] || 0) + seconds;
    if (current >= entry.durationSeconds) {
      completed++;
      delete blockFocusSeconds[entry.id];
    } else {
      blockFocusSeconds[entry.id] = current;
    }
  }
  if (completed > 0) update({ blockFocusSeconds, schedulesCompleted: statsState.schedulesCompleted + completed });
  else if (entries.some(entry => blockFocusSeconds[entry.id] !== statsState.blockFocusSeconds[entry.id])) {
    update({ blockFocusSeconds });
  }
}