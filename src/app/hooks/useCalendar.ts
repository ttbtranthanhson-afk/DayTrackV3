import { useState, useEffect } from 'react';
import { days, type ScheduleBlock, type ScheduleFormData, type ScheduleTask } from './scheduleData';
import { useScheduleData } from './scheduleStore';
import {
  useCalendarData,
  addCalendarBlock,
  updateCalendarBlock,
  deleteCalendarBlock,
  dateKey,
} from './calendarStore';

export const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export type CalendarSchedule = ScheduleBlock & { source: 'weekday' | 'date' };

export const holidays: Record<number, string> = {
  1: 'Ngày Quốc tế',
  19: 'Tết Đoan Ngọ',
};

export const scheduleColors = [
  'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-orange-400', 'bg-pink-400',
];

export const monthNames = [
  'Thg 1','Thg 2','Thg 3','Thg 4','Thg 5','Thg 6',
  'Thg 7','Thg 8','Thg 9','Thg 10','Thg 11','Thg 12',
];

interface UseCalendarProps {
  onAddTasks?: (tasks: ScheduleTask[], scheduleName: string, day: string, dateKey?: string) => void;
}

export function useCalendar({ onAddTasks }: UseCalendarProps = {}) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [lockedDays, setLockedDays] = useState<Set<number>>(new Set([15, 20]));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);

  const scheduleData = useScheduleData();
  const calendarData = useCalendarData();

  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dayNameForDate = (day: number) => {
    const weekday = new Date(currentYear, currentMonth, day).getDay();
    return days[weekday === 0 ? 6 : weekday - 1];
  };

  const getDaySchedules = (day: number): CalendarSchedule[] => {
    const weekdayBlocks = (scheduleData[dayNameForDate(day)] || []).map(block => ({
      ...block,
      source: 'weekday' as const,
    }));
    const dateBlocks = (calendarData[dateKey(currentYear, currentMonth, day)] || []).map(block => ({
      ...block,
      source: 'date' as const,
    }));
    return [...weekdayBlocks, ...dateBlocks];
  };

  const isLocked = lockedDays.has(selectedDay);
  const currentSchedules = getDaySchedules(selectedDay);

  const toggleLock = (day: number) => {
    setLockedDays(prev => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const openCreateSchedule = () => {
    setEditingBlock(null);
    setIsModalOpen(true);
  };

  const openEditSchedule = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlock(null);
  };

  const handleSaveSchedule = (data: ScheduleFormData) => {
    const key = dateKey(currentYear, currentMonth, selectedDay);
    const block: ScheduleBlock = {
      id: data.id ?? Date.now().toString(),
      title: data.name,
      time: `${data.timeStart} - ${data.timeEnd}`,
      color: data.color,
      tasks: data.tasks,
    };

    if (data.id) {
      updateCalendarBlock(key, data.id, block);
    } else {
      addCalendarBlock(key, block);
    }

    if (data.tasks.length > 0 && onAddTasks) {
      onAddTasks(data.tasks, data.name, `${selectedDay} tháng ${currentMonth + 1}`, key);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    deleteCalendarBlock(dateKey(currentYear, currentMonth, selectedDay), id);
  };

  useEffect(() => {
    const handler = () => openCreateSchedule();
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
    isModalOpen,
    setIsModalOpen,
    editingBlock,
    openCreateSchedule,
    openEditSchedule,
    closeModal,
    offset,
    daysInMonth,
    isLocked,
    currentSchedules,
    getDaySchedules,
    todayDate,
    isCurrentMonth,
    toggleLock,
    handleSaveSchedule,
    handleDeleteSchedule,
  };
}
