import { useState, useEffect } from 'react';

export const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
export const dayShorts = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export interface ScheduleBlock {
  id: string;
  title: string;
  time: string;
  color: string;
  tasks?: string[];
}

export const blockColors = [
  'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-orange-400', 'bg-pink-400',
];

export const initialSchedule: Record<string, ScheduleBlock[]> = {
  'Thứ Hai': [
    { id: '1', title: 'Toán học', time: '9:00 - 10:30', color: 'bg-blue-400' },
    { id: '2', title: 'Vật lý', time: '11:00 - 12:30', color: 'bg-purple-400' },
    { id: '3', title: 'Tự học', time: '14:00 - 16:00', color: 'bg-green-400' },
  ],
  'Thứ Ba': [
    { id: '4', title: 'Hóa học', time: '9:00 - 10:30', color: 'bg-orange-400' },
    { id: '5', title: 'Tiếng Anh', time: '11:00 - 12:30', color: 'bg-pink-400' },
  ],
};

export const colorMap: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  'bg-blue-400':   { bg: 'bg-blue-50',   text: 'text-blue-900',   badge: 'bg-blue-400',   border: 'border-blue-100' },
  'bg-purple-400': { bg: 'bg-purple-50', text: 'text-purple-900', badge: 'bg-purple-400', border: 'border-purple-100' },
  'bg-green-400':  { bg: 'bg-green-50',  text: 'text-green-900',  badge: 'bg-green-400',  border: 'border-green-100' },
  'bg-orange-400': { bg: 'bg-orange-50', text: 'text-orange-900', badge: 'bg-orange-400', border: 'border-orange-100' },
  'bg-pink-400':   { bg: 'bg-pink-50',   text: 'text-pink-900',   badge: 'bg-pink-400',   border: 'border-pink-100' },
};

interface UseTimetableProps {
  onAddTasks?: (tasks: string[], scheduleName: string, day: string) => void;
}

export function useTimetable({ onAddTasks }: UseTimetableProps = {}) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [scheduleData, setScheduleData] = useState(initialSchedule);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBusyOpen, setIsBusyOpen] = useState(false);
  const [isTodayMode, setIsTodayMode] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);

  const today = new Date();
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const currentDay = days[currentDayIndex];
  const schedule = scheduleData[currentDay] || [];

  const handleCreateSchedule = (data: { name: string; tasks: string[]; timeStart: string; timeEnd: string }) => {
    const colorIdx = (scheduleData[currentDay]?.length || 0) % blockColors.length;
    const newBlock: ScheduleBlock = {
      id: Date.now().toString(),
      title: data.name,
      time: `${data.timeStart} - ${data.timeEnd}`,
      color: blockColors[colorIdx],
      tasks: data.tasks,
    };
    setScheduleData(prev => ({ ...prev, [currentDay]: [...(prev[currentDay] || []), newBlock] }));
    if (data.tasks.length > 0 && onAddTasks) {
      onAddTasks(data.tasks, data.name, currentDay);
    }
  };

  const handleDelete = (id: string) => {
    setScheduleData(prev => ({ ...prev, [currentDay]: (prev[currentDay] || []).filter(b => b.id !== id) }));
  };

  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener('nav:quick-action', handler);
    return () => window.removeEventListener('nav:quick-action', handler);
  }, []);

  return {
    currentDayIndex,
    setCurrentDayIndex,
    scheduleData,
    isModalOpen,
    setIsModalOpen,
    isBusyOpen,
    setIsBusyOpen,
    isTodayMode,
    setIsTodayMode,
    expandedScheduleId,
    setExpandedScheduleId,
    todayDayIndex,
    currentDay,
    schedule,
    handleCreateSchedule,
    handleDelete,
  };
}
