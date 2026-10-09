import { useSyncExternalStore } from 'react';
import { initialSchedule, normalizeTasks, type ScheduleBlock, type ScheduleTask } from './scheduleData';

export type ScheduleMap = Record<string, ScheduleBlock[]>;

const STORAGE_KEY = 'daytrack_weekday_schedules';

function load(): ScheduleMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ScheduleMap;
      const normalized: ScheduleMap = {};
      for (const [day, blocks] of Object.entries(parsed)) {
        normalized[day] = blocks.map(block => ({
          ...block,
          tasks: normalizeTasks(block.tasks as (ScheduleTask | string)[]),
        }));
      }
      return normalized;
    }
  } catch {
    // ignore malformed storage
  }
  return initialSchedule;
}

let scheduleState: ScheduleMap = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ScheduleMap {
  return scheduleState;
}

function emit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleState));
  } catch {
    // ignore storage write failures
  }
  listeners.forEach(listener => listener());
}

export function useScheduleData(): ScheduleMap {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function addScheduleBlock(day: string, block: ScheduleBlock) {
  scheduleState = { ...scheduleState, [day]: [...(scheduleState[day] || []), block] };
  emit();
}

export function deleteScheduleBlock(day: string, id: string) {
  scheduleState = {
    ...scheduleState,
    [day]: (scheduleState[day] || []).filter(block => block.id !== id),
  };
  emit();
}

export function updateScheduleBlock(day: string, id: string, block: ScheduleBlock) {
  scheduleState = {
    ...scheduleState,
    [day]: (scheduleState[day] || []).map(current => (current.id === id ? block : current)),
  };
  emit();
}
