import { useState, useRef, useEffect } from 'react';

export const musicCategories = [
  { id: 'study', name: 'Học tập', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  { id: 'work', name: 'Làm việc', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  { id: 'exercise', name: 'Tập luyện', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  { id: 'relax', name: 'Thư giãn', color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  { id: 'focus', name: 'Tập trung sâu', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
];

export const presetTimes = [
  { label: '25 phút', seconds: 25 * 60 },
  { label: '45 phút', seconds: 45 * 60 },
  { label: '60 phút', seconds: 60 * 60 },
];

export const tabs = ['Bộ đếm', 'Nhạc nền'] as const;
export type Tab = typeof tabs[number];

export function useFocus() {
  const [activeTab, setActiveTab] = useState<Tab>('Bộ đếm');
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
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

  const toggleTimer = () => {
    if (!isRunning) {
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total === 0) return;
      setTotalTime(total);
      setCurrentTime(total);
      setIsRunning(true);
      setShowMusicPlayer(true);
      setVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&loop=1&playlist=dQw4w9WgXcQ');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } else {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    const handler = () => toggleTimer();
    window.addEventListener('nav:quick-action', handler);
    return () => window.removeEventListener('nav:quick-action', handler);
  }, [hours, minutes, seconds, isRunning, currentTime]);

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setTotalTime(0);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setShowMusicPlayer(false);
    setVideoUrl('');
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
    showMusicPlayer,
    videoUrl,
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
