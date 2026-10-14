import { useSyncExternalStore } from 'react';
import type * as React from 'react';
import type { BlockType } from '../../../shared/ai';
import {
  musicCategories,
  allSongs,
  CUSTOM_CATEGORY,
  NONE_CATEGORY,
  formatDuration,
  type Song,
  type MusicCategory,
} from './musicData';
import { musicEngine } from './musicEngine';
import { consumePendingFocus } from './focusLauncher';
import { getAccountItem, setAccountItem, onAccountChange } from './accountStorage';
import { getScheduleSnapshot } from './scheduleStore';
import { getCalendarSnapshot, dateKey } from './calendarStore';
import { days, type ScheduleBlock } from './scheduleData';
import { addFocusProgress, addFocusSession, addFocusToBlock } from './achievementStats';
import { beginBlockFocus, onBlockFocusComplete, onBlockFocusStopped } from './focusBlockTracker';

export { musicCategories, allSongs, CUSTOM_CATEGORY, NONE_CATEGORY, formatDuration };
export type { Song, MusicCategory };

export const presetTimes = [
  { label: '25 phút', seconds: 25 * 60 },
  { label: '45 phút', seconds: 45 * 60 },
  { label: '60 phút', seconds: 60 * 60 },
  { label: '0 phút', seconds: 0 },
];

export const tabs = ['Lịch sắp tới', 'Nhạc nền'] as const;
export type Tab = typeof tabs[number];
export type TimeType = 'hours' | 'minutes' | 'seconds';

const CUSTOM_STORAGE_KEY = 'daytrack_custom_music';

function loadCustomPlaylist(): string[] {
  try {
    const raw = getAccountItem(CUSTOM_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function timeToMinutes(value: string): number | null {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return +match[1] * 60 + +match[2];
}

function isWithinBlock(block: ScheduleBlock, minutes: number): boolean {
  const match = block.time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return false;
  const start = timeToMinutes(match[1]);
  const end = timeToMinutes(match[2]);
  if (start === null || end === null) return false;
  return minutes >= start && minutes < end;
}

export function blockWindow(block: ScheduleBlock): { start: number; end: number } | null {
  const match = block.time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return null;
  const start = timeToMinutes(match[1]);
  const end = timeToMinutes(match[2]);
  if (start === null || end === null) return null;
  return { start, end };
}

function blockDurationSeconds(block: ScheduleBlock): number {
  const window = blockWindow(block);
  return window ? Math.max((window.end - window.start) * 60, 0) : 0;
}

export function musicCategoryForType(type?: BlockType): string {
  if (type === 'study') return 'study';
  if (type === 'exercise') return 'exercise';
  return 'relax';
}

export const blockTypeInfo: Record<string, { label: string; badge: string; dot: string }> = {
  study: { label: 'Học tập', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  eating: { label: 'Ăn uống', badge: 'bg-pink-100 text-pink-700', dot: 'bg-pink-400' },
  exercise: { label: 'Tập luyện', badge: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
  other: { label: 'Khác', badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

export interface FocusStoreState {
  activeTab: Tab;
  isRunning: boolean;
  totalTime: number;
  currentTime: number;
  hours: number;
  minutes: number;
  seconds: number;
  selectedMusic: string;
  customPlaylist: string[];
  customSelection: string[];
  musicPanel: string | null;
  currentSong: Song | null;
  musicTime: number;
  musicDuration: number;
  circleScale: number;
  isShaking: boolean;
  clockNow: number;
  pendingBlock: ScheduleBlock | null;
}

function initialState(): FocusStoreState {
  return {
    activeTab: 'Lịch sắp tới',
    isRunning: false,
    totalTime: 0,
    currentTime: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    selectedMusic: 'none',
    customPlaylist: loadCustomPlaylist(),
    customSelection: [],
    musicPanel: null,
    currentSong: null,
    musicTime: 0,
    musicDuration: 0,
    circleScale: 1,
    isShaking: false,
    clockNow: Date.now(),
    pendingBlock: null,
  };
}

let state: FocusStoreState = initialState();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): FocusStoreState {
  return state;
}

function setState(patch: Partial<FocusStoreState>) {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
}

// ── module-level runtime (survives navigation/unmount) ──
let focusAcc = { focus: 0, study: 0, morning: 0 };
let blockAcc: Record<string, { seconds: number; duration: number }> = {};
let runSeconds = 0;
let sessionStudy = false;
let activeBlockId: string | null = null;
let touchStart: { y: number; type: TimeType } | null = null;
let timerId: number | null = null;
let shakeId: number | null = null;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getTodayBlocks(): ScheduleBlock[] {
  const now = new Date();
  const index = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const key = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
  const scheduleData = getScheduleSnapshot();
  const calendarData = getCalendarSnapshot();
  return [...(scheduleData[days[index]] || []), ...(calendarData[key] || [])];
}

function flushFocusProgress() {
  const acc = focusAcc;
  if (acc.focus || acc.study || acc.morning) {
    addFocusProgress({
      focusSeconds: acc.focus,
      studySeconds: acc.study,
      studyMorningSeconds: acc.morning,
    });
    focusAcc = { focus: 0, study: 0, morning: 0 };
  }
  const blockEntries = Object.entries(blockAcc);
  if (blockEntries.length) {
    const seconds = Math.max(...blockEntries.map(([, value]) => value.seconds));
    addFocusToBlock(
      blockEntries.map(([id, value]) => ({ id, durationSeconds: value.duration })),
      seconds,
    );
    blockAcc = {};
  }
}

function recordFocusTick() {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const blocks = getTodayBlocks();
  const block = blocks.find(b => isWithinBlock(b, minutesNow));
  if (block?.id) {
    const match = block.time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    const duration = match ? (timeToMinutes(match[2])! - timeToMinutes(match[1])!) * 60 : 0;
    const current = blockAcc[block.id];
    blockAcc[block.id] = {
      seconds: (current?.seconds || 0) + 1,
      duration: current?.duration || duration || 1,
    };
  }
  const inStudy = block?.type === 'study';
  focusAcc.focus += 1;
  runSeconds += 1;
  if (inStudy) {
    focusAcc.study += 1;
    sessionStudy = true;
    if (now.getHours() < 12) focusAcc.morning += 1;
  }
  if (focusAcc.focus >= 15) flushFocusProgress();
}

function finishFocusSession() {
  const totalRun = runSeconds;
  const wasStudy = sessionStudy;
  flushFocusProgress();
  if (totalRun >= 60) addFocusSession(totalRun, wasStudy);
  runSeconds = 0;
  sessionStudy = false;
}

function stopTicking() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function tick() {
  recordFocusTick();
  if (state.totalTime === 0) {
    setState({ currentTime: state.currentTime + 1 });
    return;
  }
  if (state.currentTime <= 1) {
    setState({ currentTime: 0 });
    stopRun();
    musicEngine.stop();
    return;
  }
  setState({ currentTime: state.currentTime - 1 });
}

function startTicking() {
  if (timerId !== null) return;
  timerId = window.setInterval(tick, 1000);
}

// Finalize a run that has just stopped (pause or natural completion).
function stopRun() {
  finishFocusSession();
  const blockId = activeBlockId;
  if (blockId) {
    if (state.totalTime > 0 && state.currentTime === 0) onBlockFocusComplete(blockId);
    else onBlockFocusStopped(blockId);
    activeBlockId = null;
  }
  stopTicking();
  setState({ isRunning: false });
}

function bump() {
  setState({ isShaking: true });
  if (shakeId !== null) clearTimeout(shakeId);
  shakeId = window.setTimeout(() => setState({ isShaking: false }), 500);
}

function playCategory(category: string) {
  musicEngine.stop();
  setState({ currentSong: null });
  if (category === 'none') return;
  const songs =
    category === 'custom'
      ? state.customPlaylist
          .map(id => allSongs.find(song => song.id === id))
          .filter((song): song is Song => Boolean(song))
      : allSongs.filter(song => song.category === category);
  if (!songs.length) return;
  const chosen = songs[Math.floor(Math.random() * songs.length)];
  musicEngine.play(chosen);
  setState({ currentSong: chosen });
}

function startBlock(block: ScheduleBlock, seconds: number) {
  if (seconds <= 0) return;
  const category = state.customPlaylist.length > 0 ? 'custom' : musicCategoryForType(block.type);
  launchTimer(seconds, category);
  const key = block.id || block.title;
  if (activeBlockId && activeBlockId !== key) onBlockFocusStopped(activeBlockId);
  activeBlockId = key;
  beginBlockFocus(key);
}

// ── public actions ──

export function setActiveTab(tab: Tab) {
  setState({ activeTab: tab });
}

export function setSelectedMusic(id: string) {
  setState({ selectedMusic: id });
}

export function getSongs(categoryId: string): Song[] {
  if (categoryId === 'custom') return allSongs;
  return musicCategories.find(cat => cat.id === categoryId)?.songs ?? [];
}

export function selectCategory(id: string) {
  setState({ selectedMusic: id, ...(id === 'custom' ? { customSelection: [] } : {}) });
}

export function openMusicPanel(id: string) {
  setState({
    musicPanel: id,
    ...(id === 'custom' ? { customSelection: [...state.customPlaylist] } : {}),
  });
}

export function closeMusicPanel() {
  setState({ musicPanel: null });
}

export function toggleCustomSong(song: Song) {
  const songId = song.id;
  setState({
    customSelection: state.customSelection.includes(songId)
      ? state.customSelection.filter(id => id !== songId)
      : [...state.customSelection, songId],
  });
}

export function saveCustomPlaylist() {
  const next = [...state.customSelection];
  setState({ customPlaylist: next, selectedMusic: 'custom', musicPanel: null });
  setAccountItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
}

export function quickAddCurrent() {
  if (!state.currentSong || state.customPlaylist.includes(state.currentSong.id)) return;
  const next = [...state.customPlaylist, state.currentSong.id];
  setState({
    customPlaylist: next,
    customSelection: state.customSelection.includes(state.currentSong.id)
      ? state.customSelection
      : [...state.customSelection, state.currentSong.id],
  });
  setAccountItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
}

export function previewSong(song: Song) {
  if (state.currentSong?.id === song.id && musicEngine.isPlayingId(song.id)) {
    musicEngine.stop();
    setState({ currentSong: null, musicTime: 0, musicDuration: 0 });
    return;
  }
  musicEngine.play(song);
  setState({ currentSong: song, musicTime: 0, musicDuration: 0 });
}

export function toggleSong(song: Song) {
  musicEngine.togglePlay(song);
  setState({
    currentSong: song,
    musicTime: musicEngine.getCurrentTime(),
    musicDuration: musicEngine.getDuration(),
  });
}

export function replaySong() {
  musicEngine.replay();
  setState({ musicTime: musicEngine.getCurrentTime() });
}

export function updateTime(type: TimeType, increment: number) {
  if (type === 'hours') setState({ hours: clamp(state.hours + increment, 0, 23) });
  else if (type === 'minutes') setState({ minutes: clamp(state.minutes + increment, 0, 59) });
  else setState({ seconds: clamp(state.seconds + increment, 0, 59) });
  setState({ circleScale: increment > 0 ? 1.03 : 0.97 });
  setTimeout(() => setState({ circleScale: 1 }), 150);
}

export function handleWheel(type: TimeType, delta: number) {
  updateTime(type, delta > 0 ? -1 : 1);
}

export function handleTouchStart(e: React.TouchEvent, type: TimeType) {
  e.preventDefault();
  touchStart = { y: e.touches[0].clientY, type };
}

export function handleTouchMove(e: React.TouchEvent) {
  e.preventDefault();
  if (!touchStart) return;
  const deltaY = touchStart.y - e.touches[0].clientY;
  if (Math.abs(deltaY) > 20) {
    updateTime(touchStart.type, deltaY > 0 ? 1 : -1);
    touchStart.y = e.touches[0].clientY;
  }
}

export function handleTouchEnd() {
  touchStart = null;
}

export function startTimer(totalSeconds: number) {
  setState({
    totalTime: totalSeconds,
    currentTime: totalSeconds === 0 ? 0 : totalSeconds,
    isRunning: true,
  });
  playCategory(state.selectedMusic);
  bump();
  startTicking();
}

export function resumeTimer() {
  setState({ isRunning: true });
  playCategory(state.selectedMusic);
  bump();
  startTicking();
}

export function launchTimer(totalSeconds: number, category: string) {
  setState({
    selectedMusic: category,
    totalTime: totalSeconds,
    currentTime: totalSeconds,
    isRunning: true,
  });
  playCategory(category);
  bump();
  startTicking();
}

export function toggleTimer() {
  if (!state.isRunning) {
    if (state.currentTime > 0) {
      resumeTimer();
      return;
    }
    const total = state.hours * 3600 + state.minutes * 60 + state.seconds;
    startTimer(total);
  } else {
    setState({ currentSong: null });
    stopRun();
    musicEngine.stop();
  }
}

export function resetTimer() {
  if (state.isRunning) stopRun();
  musicEngine.stop();
  setState({
    currentTime: 0,
    totalTime: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    currentSong: null,
  });
}

export function setPresetTime(presetSeconds: number) {
  setState({
    hours: Math.floor(presetSeconds / 3600),
    minutes: Math.floor((presetSeconds % 3600) / 60),
    seconds: presetSeconds % 60,
  });
}

export function launchBlock(block: ScheduleBlock) {
  const window = blockWindow(block);
  if (!window) return;
  if (state.pendingBlock) setState({ pendingBlock: null });
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  if (minutesNow >= window.start) {
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const endSeconds = window.end * 60;
    startBlock(block, Math.max(endSeconds - nowSeconds, 0));
  } else {
    const seconds = blockDurationSeconds(block);
    if (seconds > 0) {
      setState({
        hours: Math.floor(seconds / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: seconds % 60,
      });
    }
    setState({ pendingBlock: block });
  }
}

export function dismissPending() {
  setState({ pendingBlock: null });
}

export function acceptPending() {
  const block = state.pendingBlock;
  if (!block) return;
  setState({ pendingBlock: null });
  startBlock(block, blockDurationSeconds(block));
}

// ── module-level subscriptions ──

if (typeof window !== 'undefined') {
  musicEngine.setOnTimeUpdate(() => {
    setState({ musicTime: musicEngine.getCurrentTime(), musicDuration: musicEngine.getDuration() });
  });

  window.setInterval(() => setState({ clockNow: Date.now() }), 30000);

  window.addEventListener('nav:quick-action', () => toggleTimer());

  window.addEventListener('focus:auto-start', (e: Event) => {
    consumePendingFocus();
    const secs = (e as CustomEvent<{ seconds: number }>).detail?.seconds;
    if (typeof secs === 'number' && secs > 0) startTimer(secs);
  });

  const pending = consumePendingFocus();
  if (pending !== null) startTimer(pending);
}

onAccountChange(() => {
  stopTicking();
  musicEngine.stop();
  focusAcc = { focus: 0, study: 0, morning: 0 };
  blockAcc = {};
  runSeconds = 0;
  sessionStudy = false;
  activeBlockId = null;
  setState({
    customPlaylist: loadCustomPlaylist(),
    customSelection: [],
    isRunning: false,
    totalTime: 0,
    currentTime: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    currentSong: null,
    musicTime: 0,
    musicDuration: 0,
    musicPanel: null,
    pendingBlock: null,
  });
});

export function useFocusState(): FocusStoreState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function getFocusSnapshot(): FocusStoreState {
  return state;
}
