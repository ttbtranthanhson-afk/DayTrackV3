import { useSyncExternalStore } from 'react';
import { normalizeTasks, type ScheduleBlock, type ScheduleTask } from './scheduleData';

export type CalendarScheduleMap = Record<string, ScheduleBlock[]>;

const STORAGE_KEY = 'daytrack_calendar_schedules';

function load(): CalendarScheduleMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarState));
  } catch {
    // ignore storage write failures
  }
  listeners.forEach(listener => listener());
}

export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${month + 1}-${day}`;
}

export function useCalendarData(): CalendarScheduleMap {
  return useSyncExternalStore(subscribe, getSnapshot);
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
  calendarState = {
    ...calendarState,
    [key]: (calendarState[key] || []).filter(block => block.id !== id),
  };
  emit();
}
