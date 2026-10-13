import { useSyncExternalStore } from 'react';
import { isDateKeyBefore } from './calendarStore';
import { getAccountItem, setAccountItem, onAccountChange } from './accountStorage';

export type BusyMap = Record<string, string[]>;

const STORAGE_KEY = 'daytrack_busy_hours';

function load(): BusyMap {
  try {
    const raw = getAccountItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BusyMap;
      const normalized: BusyMap = {};
      for (const [key, ranges] of Object.entries(parsed)) {
        if (Array.isArray(ranges)) {
          normalized[key] = ranges.filter((r): r is string => typeof r === 'string');
        }
      }
      return normalized;
    }
  } catch {
    // ignore malformed storage
  }
  return {};
}

let busyState: BusyMap = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): BusyMap {
  return busyState;
}

function emit() {
  setAccountItem(STORAGE_KEY, JSON.stringify(busyState));
  listeners.forEach(listener => listener());
}

onAccountChange(() => {
  busyState = load();
  listeners.forEach(listener => listener());
});

export function useBusyData(): BusyMap {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function setBusyRanges(key: string, ranges: string[]) {
  if (ranges.length === 0) {
    if (!(key in busyState)) return;
    const next = { ...busyState };
    delete next[key];
    busyState = next;
  } else {
    busyState = { ...busyState, [key]: ranges };
  }
  emit();
}

export function pruneBusyData(days = 7) {
  let changed = false;
  const next: BusyMap = {};
  for (const [key, ranges] of Object.entries(busyState)) {
    if (isDateKeyBefore(key, days)) {
      changed = true;
      continue;
    }
    next[key] = ranges;
  }
  if (changed) {
    busyState = next;
    emit();
  }
}
