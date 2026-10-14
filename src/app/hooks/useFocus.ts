import { useMemo } from 'react';
import { useScheduleData } from './scheduleStore';
import { useCalendarData, dateKey } from './calendarStore';
import { days, type ScheduleBlock } from './scheduleData';
import {
  useFocusState,
  blockWindow,
  setActiveTab,
  setSelectedMusic,
  getSongs,
  selectCategory,
  openMusicPanel,
  closeMusicPanel,
  toggleCustomSong,
  saveCustomPlaylist,
  quickAddCurrent,
  previewSong,
  toggleSong,
  replaySong,
  updateTime,
  handleWheel,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  toggleTimer,
  resetTimer,
  setPresetTime,
  launchBlock,
  dismissPending,
  acceptPending,
} from './focusStore';

export {
  musicCategories,
  allSongs,
  CUSTOM_CATEGORY,
  NONE_CATEGORY,
  formatDuration,
  presetTimes,
  tabs,
  blockTypeInfo,
  blockWindow,
  musicCategoryForType,
} from './focusStore';
export type { Song, MusicCategory, Tab } from './focusStore';

export function useFocus() {
  const state = useFocusState();
  const scheduleData = useScheduleData();
  const calendarData = useCalendarData();

  const today = new Date();
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
  const todayLabel = `${dayNames[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}`;

  const upcomingBlocks = useMemo(() => {
    const ref = new Date(state.clockNow);
    const minutesNow = ref.getHours() * 60 + ref.getMinutes();
    const now = new Date();
    const index = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const key = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
    const blocks: ScheduleBlock[] = [...(scheduleData[days[index]] || []), ...(calendarData[key] || [])];
    return blocks
      .filter(block => {
        const window = blockWindow(block);
        return window !== null && window.end > minutesNow;
      })
      .sort((a, b) => (blockWindow(a)?.start ?? 0) - (blockWindow(b)?.start ?? 0));
  }, [scheduleData, calendarData, state.clockNow]);

  const hasSession = state.isRunning || state.totalTime > 0 || state.currentTime > 0;
  const displayHours = hasSession ? Math.floor(state.currentTime / 3600) : state.hours;
  const displayMinutes = hasSession ? Math.floor((state.currentTime % 3600) / 60) : state.minutes;
  const displaySeconds = hasSession ? state.currentTime % 60 : state.seconds;

  const progress =
    state.totalTime > 0
      ? Math.min(100, Math.max(0, ((state.totalTime - state.currentTime) / state.totalTime) * 100))
      : 0;
  const circumference = 2 * Math.PI * 95;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return {
    ...state,
    todayLabel,
    upcomingBlocks,
    hasSession,
    displayHours,
    displayMinutes,
    displaySeconds,
    progress,
    circumference,
    strokeDashoffset,
    setActiveTab,
    setSelectedMusic,
    getSongs,
    selectCategory,
    openMusicPanel,
    closeMusicPanel,
    toggleCustomSong,
    saveCustomPlaylist,
    quickAddCurrent,
    previewSong,
    toggleSong,
    replaySong,
    updateTime,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    toggleTimer,
    resetTimer,
    setPresetTime,
    launchBlock,
    dismissPending,
    acceptPending,
  };
}
