import { useState, useEffect } from 'react';
import { days, blockColors, type ScheduleBlock, type ScheduleFormData, type ScheduleTask } from './scheduleData';
import { useScheduleData, addScheduleBlock, deleteScheduleBlock, updateScheduleBlock } from './scheduleStore';

export * from './scheduleData';

interface UseTimetableProps {
  onAddTasks?: (tasks: ScheduleTask[], scheduleName: string, day: string, dateKey?: string) => void;
}

export function useTimetable({ onAddTasks }: UseTimetableProps = {}) {
  const today = new Date();
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const [currentDayIndex, setCurrentDayIndex] = useState(todayDayIndex);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [isBusyOpen, setIsBusyOpen] = useState(false);
  const [isTodayMode, setIsTodayMode] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);

  const scheduleData = useScheduleData();

  const currentDay = days[currentDayIndex];
  const schedule = scheduleData[currentDay] || [];

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
    const block: ScheduleBlock = {
      id: data.id ?? Date.now().toString(),
      title: data.name,
      time: `${data.timeStart} - ${data.timeEnd}`,
      color: data.color,
      tasks: data.tasks,
    };

    if (data.id) {
      updateScheduleBlock(currentDay, data.id, block);
    } else {
      addScheduleBlock(currentDay, block);
    }

    if (data.tasks.length > 0 && onAddTasks) {
      onAddTasks(data.tasks, data.name, currentDay);
    }
  };

  const handleDelete = (id: string) => {
    deleteScheduleBlock(currentDay, id);
  };

  useEffect(() => {
    const handler = () => openCreateSchedule();
    window.addEventListener('nav:quick-action', handler);
    return () => window.removeEventListener('nav:quick-action', handler);
  }, []);

  return {
    currentDayIndex,
    setCurrentDayIndex,
    scheduleData,
    isModalOpen,
    setIsModalOpen,
    editingBlock,
    openCreateSchedule,
    openEditSchedule,
    closeModal,
    isBusyOpen,
    setIsBusyOpen,
    isTodayMode,
    setIsTodayMode,
    expandedScheduleId,
    setExpandedScheduleId,
    todayDayIndex,
    currentDay,
    schedule,
    handleSaveSchedule,
    handleDelete,
  };
}
