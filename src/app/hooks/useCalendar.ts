import { useState, useEffect } from 'react';

export const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const holidays: Record<number, string> = {
  1: 'Ngày Quốc tế',
  19: 'Tết Đoan Ngọ',
};

export interface DaySchedule {
  id: string;
  title: string;
  time: string;
  color: string;
  tasks?: string[];
}

export const scheduleColors = [
  'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-orange-400', 'bg-pink-400',
];

export const monthNames = [
  'Thg 1','Thg 2','Thg 3','Thg 4','Thg 5','Thg 6',
  'Thg 7','Thg 8','Thg 9','Thg 10','Thg 11','Thg 12',
];

const sampleSchedules: Record<number, DaySchedule[]> = {
  17: [
    { id: '1', title: 'Toán học', time: '9:00 - 10:30', color: 'bg-blue-400' },
    { id: '2', title: 'Vật lý', time: '11:00 - 12:30', color: 'bg-purple-400' },
  ],
};

interface UseCalendarProps {
  onAddTasks?: (tasks: string[], scheduleName: string, day: string) => void;
}

export function useCalendar({ onAddTasks }: UseCalendarProps = {}) {
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed = 5)
  const [currentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(16);
  const [lockedDays, setLockedDays] = useState<Set<number>>(new Set([15, 20]));
  const [daySchedules, setDaySchedules] = useState<Record<number, DaySchedule[]>>(sampleSchedules);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const isLocked = lockedDays.has(selectedDay);
  const currentSchedules = daySchedules[selectedDay] || [];

  const toggleLock = (day: number) => {
    setLockedDays(prev => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const handleCreateSchedule = (data: { name: string; tasks: string[]; timeStart: string; timeEnd: string }) => {
    const colorIdx = (daySchedules[selectedDay]?.length || 0) % scheduleColors.length;
    const newSchedule: DaySchedule = {
      id: Date.now().toString(),
      title: data.name,
      time: `${data.timeStart} - ${data.timeEnd}`,
      color: scheduleColors[colorIdx],
      tasks: data.tasks,
    };
    setDaySchedules(prev => ({ ...prev, [selectedDay]: [...(prev[selectedDay] || []), newSchedule] }));
    if (data.tasks.length > 0 && onAddTasks) {
      onAddTasks(data.tasks, data.name, `${selectedDay} tháng ${currentMonth + 1}`);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setDaySchedules(prev => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter(s => s.id !== id),
    }));
  };

  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener('nav:quick-action', handler);
    return () => window.removeEventListener('nav:quick-action', handler);
  }, []);

  return {
    currentMonth,
    setCurrentMonth,
    currentYear,
    selectedDay,
    setSelectedDay,
    lockedDays,
    daySchedules,
    isModalOpen,
    setIsModalOpen,
    offset,
    daysInMonth,
    isLocked,
    currentSchedules,
    todayDate,
    isCurrentMonth,
    toggleLock,
    handleCreateSchedule,
    handleDeleteSchedule,
  };
}
