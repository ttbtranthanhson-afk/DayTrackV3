import { getAccountItem, setAccountItem } from './accountStorage';

const STORAGE_KEY = 'daytrack_focus_blocks';

interface FocusBlockState {
  dateKey: string;
  active: string[];
  completed: string[];
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function defaultState(): FocusBlockState {
  return { dateKey: todayKey(), active: [], completed: [] };
}

function load(): FocusBlockState {
  try {
    const raw = getAccountItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<FocusBlockState>) : {};
    const dateKey = typeof parsed.dateKey === 'string' ? parsed.dateKey : todayKey();
    if (dateKey !== todayKey()) return defaultState();
    return {
      dateKey,
      active: Array.isArray(parsed.active) ? parsed.active.filter((x): x is string => typeof x === 'string') : [],
      completed: Array.isArray(parsed.completed)
        ? parsed.completed.filter((x): x is string => typeof x === 'string')
        : [],
    };
  } catch {
    return defaultState();
  }
}

function save(state: FocusBlockState) {
  setAccountItem(STORAGE_KEY, JSON.stringify(state));
}

export function getFocusBlockState(): FocusBlockState {
  return load();
}

export function isBlockFocusActive(id: string): boolean {
  return load().active.includes(id);
}

export function isBlockFocusCompleted(id: string): boolean {
  return load().completed.includes(id);
}

export function beginBlockFocus(id: string) {
  const state = load();
  if (state.active.includes(id) || state.completed.includes(id)) return;
  save({ ...state, active: [...state.active, id] });
}

export function onBlockFocusComplete(id: string) {
  const state = load();
  save({
    ...state,
    active: state.active.filter(x => x !== id),
    completed: state.completed.includes(id) ? state.completed : [...state.completed, id],
  });
}

export function onBlockFocusStopped(id: string) {
  const state = load();
  save({ ...state, active: state.active.filter(x => x !== id) });
}