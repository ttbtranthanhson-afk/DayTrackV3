import { useSyncExternalStore } from 'react';
import type { AchievementIdea } from '../../../shared/ai';

export interface AiAchievement {
  id: string;
  title: string;
  description: string;
  reason: string;
  emoji: string;
  unit: string;
  target: number;
  current: number;
  scheduleName: string;
  day: string;
  color: string;
  barColor: string;
  createdAt: string;
}

export interface AchievementTask {
  id: string;
  scheduleName?: string;
  completed: boolean;
  completedDate?: string;
  recurrence?: string;
}

const STORAGE_KEY = 'daytrack_achievements';

const PALETTE = [
  { color: 'bg-amber-400', barColor: 'bg-amber-400' },
  { color: 'bg-violet-400', barColor: 'bg-violet-400' },
  { color: 'bg-emerald-400', barColor: 'bg-emerald-400' },
  { color: 'bg-sky-400', barColor: 'bg-sky-400' },
  { color: 'bg-rose-400', barColor: 'bg-rose-400' },
  { color: 'bg-indigo-400', barColor: 'bg-indigo-400' },
];

function load(): AiAchievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AiAchievement[];
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item.title === 'string');
      }
    }
  } catch {
    // ignore malformed storage
  }
  return [];
}

let achievementState: AiAchievement[] = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AiAchievement[] {
  return achievementState;
}

function emit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievementState));
  } catch {
    // ignore storage write failures
  }
  listeners.forEach(listener => listener());
}

export function useAchievements(): AiAchievement[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isTaskDone(task: AchievementTask): boolean {
  return task.recurrence === 'daily' ? task.completedDate === todayKey() : task.completed;
}

function doneBySchedule(tasks: AchievementTask[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    if (!task.scheduleName || !isTaskDone(task)) continue;
    counts.set(task.scheduleName, (counts.get(task.scheduleName) ?? 0) + 1);
  }
  return counts;
}

export function syncAchievementsWithTasks(prev: AchievementTask[], next: AchievementTask[]) {
  if (!achievementState.length) return;

  const before = doneBySchedule(prev);
  const after = doneBySchedule(next);

  const names = new Set([...before.keys(), ...after.keys()]);
  const deltas = new Map<string, number>();
  for (const name of names) {
    const delta = (after.get(name) ?? 0) - (before.get(name) ?? 0);
    if (delta !== 0) deltas.set(name, delta);
  }

  if (!deltas.size) return;

  let changed = false;
  const updated = achievementState.map(achievement => {
    const delta = deltas.get(achievement.scheduleName);
    if (!delta) return achievement;
    const current = Math.min(Math.max(achievement.current + delta, 0), achievement.target);
    if (current === achievement.current) return achievement;
    changed = true;
    return { ...achievement, current };
  });

  if (changed) {
    achievementState = updated;
    emit();
  }
}

export function addAiAchievements(
  ideas: AchievementIdea[],
  meta: { scheduleName: string; day: string },
): AiAchievement[] {
  if (!ideas.length) return [];

  const existingTitles = new Set(achievementState.map(item => item.title));
  const created: AiAchievement[] = [];

  ideas.forEach((idea, index) => {
    if (existingTitles.has(idea.title)) return;
    const tone = PALETTE[(achievementState.length + index) % PALETTE.length];
    created.push({
      id: `ach-${Date.now()}-${index}`,
      title: idea.title,
      description: idea.description,
      reason: idea.reason,
      emoji: idea.emoji,
      unit: idea.unit,
      target: idea.target,
      current: 0,
      scheduleName: meta.scheduleName,
      day: meta.day,
      color: tone.color,
      barColor: tone.barColor,
      createdAt: new Date().toISOString(),
    });
  });

  if (created.length) {
    achievementState = [...achievementState, ...created];
    emit();
  }

  return created;
}
