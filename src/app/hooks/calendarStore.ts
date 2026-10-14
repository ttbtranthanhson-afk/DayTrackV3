import { useSyncExternalStore } from 'react';
import { normalizeTasks, type ScheduleBlock, type ScheduleTask } from './scheduleData';
import { getAccountItem, setAccountItem, onAccountChange } from './accountStorage';

export type CalendarScheduleMap = Record<string, ScheduleBlock[]>;

const STORAGE_KEY = 'daytrack_calendar_schedules';
const AI_DAYS_KEY = 'daytrack_calendar_ai_days';

function loadAiDays(): Set<string> {
  try {
    const raw = getAccountItem(AI_DAYS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return new Set(parsed.filter((key): key is string => typeof key === 'string'));
    }
  } catch {
    // ignore malformed storage
  }
  return new Set();
}

function load(): CalendarScheduleMap {
  try {
    const raw = getAccountItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, ScheduleBlock[]>;
      const normalized: CalendarScheduleMap = {};
      for (const [key, blocks] of Object.entries(parsed)) {
        normalized[key] = blocks.map(block => ({
          ...block,
          tasks: normalizeTasks(block.tasks as (ScheduleTask | string)[]),
        }));
      }
      return normalized;
    }
  } catch {
    // ignore malformed storage
  }
  return {};
}

let calendarState: CalendarScheduleMap = load();
let aiPlannedDays = loadAiDays();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CalendarScheduleMap {
  return calendarState;
}

function emit() {
  setAccountItem(STORAGE_KEY, JSON.stringify(calendarState));
  setAccountItem(AI_DAYS_KEY, JSON.stringify([...aiPlannedDays]));
  listeners.forEach(listener => listener());
}

onAccountChange(() => {
  calendarState = load();
  aiPlannedDays = loadAiDays();
  listeners.forEach(listener => listener());
});

export function isAiPlannedDay(key: string): boolean {
  return aiPlannedDays.has(key);
}

export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${month + 1}-${day}`;
}

export function dateKeyToTime(key: string): number | null {
  const match = key.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  const date = new Date(+match[1], +match[2] - 1, +match[3]);
  if (Number.isNaN(date.getTime())) return null;
  return date.getTime();
}

export function isDateKeyBefore(key: string, days: number): boolean {
  const time = dateKeyToTime(key);
  if (time === null) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return time < cutoff.getTime();
}

export function useCalendarData(): CalendarScheduleMap {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function getCalendarSnapshot(): CalendarScheduleMap {
  return calendarState;
}

export function addCalendarBlock(key: string, block: ScheduleBlock) {
  calendarState = { ...calendarState, [key]: [...(calendarState[key] || []), block] };
  emit();
}

export function updateCalendarBlock(key: string, id: string, block: ScheduleBlock) {
  calendarState = {
    ...calendarState,
    [key]: (calendarState[key] || []).map(current => (current.id === id ? block : current)),
  };
  emit();
}

export function deleteCalendarBlock(key: string, id: string) {
  const remaining = (calendarState[key] || []).filter(block => block.id !== id);
  calendarState = { ...calendarState, [key]: remaining };
  if (remaining.length === 0) aiPlannedDays.delete(key);
  emit();
}

export function replaceCalendarDay(key: string, blocks: ScheduleBlock[]) {
  calendarState = { ...calendarState, [key]: blocks };
  if (blocks.length > 0) aiPlannedDays.add(key);
  else aiPlannedDays.delete(key);
  emit();
}

export function pruneCalendarData(days = 7) {
  let changed = false;
  const next: CalendarScheduleMap = {};
  for (const [key, blocks] of Object.entries(calendarState)) {
    if (isDateKeyBefore(key, days)) {
      changed = true;
      aiPlannedDays.delete(key);
      continue;
    }
    next[key] = blocks;
  }
  if (changed) {
    calendarState = next;
    emit();
  }
}
