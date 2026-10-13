import { useState, useRef, useEffect } from 'react';
import {
  musicCategories,
  allSongs,
  CUSTOM_CATEGORY,
  NONE_CATEGORY,
  type Song,
  type MusicCategory,
} from './musicData';
import { musicEngine } from './musicEngine';
import { consumePendingFocus } from './focusLauncher';
import { getAccountItem, setAccountItem, onAccountChange } from './accountStorage';

export { musicCategories, allSongs, CUSTOM_CATEGORY, NONE_CATEGORY };
export type { Song, MusicCategory };

export const presetTimes = [
  { label: '25 phút', seconds: 25 * 60 },
  { label: '45 phút', seconds: 45 * 60 },
  { label: '60 phút', seconds: 60 * 60 },
];

export const tabs = ['Hướng dẫn', 'Nhạc nền'] as const;
export type Tab = typeof tabs[number];

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

export function useFocus() {
  const [activeTab, setActiveTab] = useState<Tab>('Hướng dẫn');
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [selectedMusic, setSelectedMusic] = useState<string>('none');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [customPlaylist, setCustomPlaylist] = useState<string[]>(loadCustomPlaylist);
  const [customSelection, setCustomSelection] = useState<string[]>([]);
  const [customEditing, setCustomEditing] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [circleScale, setCircleScale] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const timerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ y: number; type: 'hours' | 'minutes' | 'seconds' } | null>(null);

  const today = new Date();
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
  const todayLabel = `${dayNames[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}`;

  useEffect(() => {
    if (isRunning && currentTime > 0) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            musicEngine.stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, currentTime]);

  useEffect(() => () => musicEngine.stop(), []);

  useEffect(() => onAccountChange(() => {
    setCustomPlaylist(loadCustomPlaylist());
    setCustomSelection([]);
    setCustomEditing(false);
  }), []);

  const getSongs = (categoryId: string): Song[] => {
    if (categoryId === 'custom') {
      return allSongs.filter(song => customPlaylist.includes(song.id));
    }
    return musicCategories.find(cat => cat.id === categoryId)?.songs ?? [];
  };

  const selectCategory = (id: string) => {
    if (id === 'none') {
      setSelectedMusic('none');
      setExpandedCategory(null);
      setCustomEditing(false);
      return;
    }
    if (id === 'custom') {
      setSelectedMusic('custom');
      setCustomSelection([...customPlaylist]);
      setCustomEditing(true);
      setExpandedCategory('custom');
      return;
    }
    setSelectedMusic(id);
    setExpandedCategory(prev => (prev === id ? null : id));
  };

  const toggleCustomSong = (songId: string) => {
    setCustomSelection(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const saveCustomPlaylist = () => {
    const next = [...customSelection];
    setCustomPlaylist(next);
    setAccountItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
    setCustomEditing(false);
  };

  const previewSong = (song: Song) => {
    musicEngine.play(song);
    setCurrentSong(song);
  };

  const updateTime = (type: 'hours' | 'minutes' | 'seconds', increment: number) => {
    if (type === 'hours') {
      setHours(prev => Math.max(0, Math.min(23, prev + increment)));
    } else if (type === 'minutes') {
      setMinutes(prev => Math.max(0, Math.min(59, prev + increment)));
    } else {
      setSeconds(prev => Math.max(0, Math.min(59, prev + increment)));
    }
    setCircleScale(increment > 0 ? 1.03 : 0.97);
    setTimeout(() => setCircleScale(1), 150);
  };

  const handleWheel = (type: 'hours' | 'minutes' | 'seconds', delta: number) => {
    updateTime(type, delta > 0 ? -1 : 1);
  };

  const handleTouchStart = (e: React.TouchEvent, type: 'hours' | 'minutes' | 'seconds') => {
    e.preventDefault();
    touchStartRef.current = { y: e.touches[0].clientY, type };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStartRef.current) return;
    const deltaY = touchStartRef.current.y - e.touches[0].clientY;
    if (Math.abs(deltaY) > 20) {
      updateTime(touchStartRef.current.type, deltaY > 0 ? 1 : -1);
      touchStartRef.current.y = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => { touchStartRef.current = null; };

  const startTimer = (totalSeconds: number) => {
    if (totalSeconds <= 0) return;
    setTotalTime(totalSeconds);
    setCurrentTime(totalSeconds);
    setIsRunning(true);

    const songs = getSongs(selectedMusic);
    if (selectedMusic !== 'none' && songs.length > 0) {
      const chosen = songs[Math.floor(Math.random() * songs.length)];
      musicEngine.play(chosen);
      setCurrentSong(chosen);
    }

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const toggleTimer = () => {
    if (!isRunning) {
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total === 0) return;
      startTimer(total);
    } else {
      setIsRunning(false);
      musicEngine.stop();
      setCurrentSong(null);
    }
  };

  useEffect(() => {
    const handler = () => toggleTimer();
    window.addEventListener('nav:quick-action', handler);
    return () => window.removeEventListener('nav:quick-action', handler);
  }, [hours, minutes, seconds, isRunning, currentTime, selectedMusic, customPlaylist]);

  useEffect(() => {
    const handler = (e: Event) => {
      consumePendingFocus();
      const secs = (e as CustomEvent<{ seconds: number }>).detail?.seconds;
      if (typeof secs === 'number' && secs > 0) startTimer(secs);
    };
    window.addEventListener('focus:auto-start', handler);
    const pending = consumePendingFocus();
    if (pending !== null) startTimer(pending);
    return () => window.removeEventListener('focus:auto-start', handler);
  }, [selectedMusic, customPlaylist]);

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setTotalTime(0);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setCurrentSong(null);
    musicEngine.stop();
  };

  const setPresetTime = (presetSeconds: number) => {
    setHours(Math.floor(presetSeconds / 3600));
    setMinutes(Math.floor((presetSeconds % 3600) / 60));
    setSeconds(presetSeconds % 60);
  };

  const displayHours = isRunning ? Math.floor(currentTime / 3600) : hours;
  const displayMinutes = isRunning ? Math.floor((currentTime % 3600) / 60) : minutes;
  const displaySeconds = isRunning ? currentTime % 60 : seconds;

  const progress = totalTime > 0 ? ((totalTime - currentTime) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 95;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return {
    activeTab,
    setActiveTab,
    isRunning,
    totalTime,
    currentTime,
    hours,
    minutes,
    seconds,
    selectedMusic,
    setSelectedMusic,
    expandedCategory,
    selectCategory,
    getSongs,
    customPlaylist,
    customSelection,
    customEditing,
    toggleCustomSong,
    saveCustomPlaylist,
    currentSong,
    previewSong,
    circleScale,
    isShaking,
    timerRef,
    touchStartRef,
    todayLabel,
    updateTime,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    toggleTimer,
    resetTimer,
    setPresetTime,
    displayHours,
    displayMinutes,
    displaySeconds,
    progress,
    circumference,
    strokeDashoffset,
  };
}
