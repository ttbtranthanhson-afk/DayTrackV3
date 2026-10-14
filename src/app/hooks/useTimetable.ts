import { useState, useEffect } from 'react';
import { days, blockColors, type AddTasksFromSchedule, type ScheduleBlock, type ScheduleFormData, type ScheduleTask } from './scheduleData';
import { useScheduleData, addScheduleBlock, deleteScheduleBlock, updateScheduleBlock } from './scheduleStore';
import { useCalendarData, isAiPlannedDay, dateKey } from './calendarStore';
import { useTutorial } from '../tutorial/tutorialStore';
import { tutorialSteps } from '../tutorial/tutorialSteps';

export * from './scheduleData';

interface UseTimetableProps {
  onAddTasks?: AddTasksFromSchedule;
}

export function useTimetable({ onAddTasks }: UseTimetableProps = {}) {
  const today = new Date();
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const { status: tutorialStatus, stepIndex: tutorialStepIndex } = useTutorial();
  const tutorialView =
    tutorialStatus === 'running' ? tutorialSteps[tutorialStepIndex]?.view : undefined;

  const [currentDayIndex, setCurrentDayIndex] = useState(todayDayIndex);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);
  const [recentlyChanged, setRecentlyChanged] = useState<string[]>([]);

  const scheduleData = useScheduleData();
  const calendarData = useCalendarData();

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const hasTodaySchedule =
    (scheduleData[days[todayDayIndex]]?.length ?? 0) > 0 ||
    (calendarData[todayKey]?.length ?? 0) > 0;
  const [isTodayMode, setIsTodayMode] = useState(() => {
    if (tutorialView === 'week') return false;
    if (tutorialView === 'today') return true;
    return hasTodaySchedule;
  });

  // While the tour is on the timetable intro/create/survey steps, keep the
  // weekly view so the + and "Khảo sát" targets are visible.
  useEffect(() => {
    if (tutorialView === 'week') setIsTodayMode(false);
    else if (tutorialView === 'today') {
      setIsTodayMode(true);
      setCurrentDayIndex(todayDayIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialView]);

  // Real dates of the current week (Monday..Sunday)
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset);
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
  );

  const currentDay = days[currentDayIndex];
  const currentDate = weekDates[currentDayIndex];
  const weekdaySchedule = scheduleData[currentDay] || [];
  const todayDateKey = dateKey(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const dateSchedule = calendarData[todayDateKey] || [];

  // Today view: an AI-generated plan for the date overrides the weekly template,
  // otherwise the date-specific blocks are shown on top of the template.
  const schedule = isTodayMode
    ? (isAiPlannedDay(todayDateKey) ? dateSchedule : [...weekdaySchedule, ...dateSchedule])
    : weekdaySchedule;

  useEffect(() => {
    setRecentlyChanged([]);
  }, [currentDayIndex]);

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

    setRecentlyChanged(prev => (prev.includes(data.name) ? prev : [...prev, data.name]));

    if (data.tasks.length > 0 && onAddTasks) {
      onAddTasks(data.tasks, data.name, currentDay, undefined, block.id);
    }
  };

  const handleDelete = (id: string) => {
    deleteScheduleBlock(currentDay, id);
  };

  useEffect(() => {
    const handler = () => openCreateSchedule();
    window.addEventListener('nav:quick-action', handler);
    window.addEventListener('tutorial:open-create', handler);
    return () => {
      window.removeEventListener('nav:quick-action', handler);
      window.removeEventListener('tutorial:open-create', handler);
    };
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
    isTodayMode,
    setIsTodayMode,
    expandedScheduleId,
    setExpandedScheduleId,
    recentlyChanged,
    clearRecentlyChanged: () => setRecentlyChanged([]),
    todayDayIndex,
    weekDates,
    currentDate,
    currentDay,
    schedule,
    handleSaveSchedule,
    handleDelete,
  };
}
