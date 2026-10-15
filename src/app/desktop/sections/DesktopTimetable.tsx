import { useState, useEffect } from 'react';
import { Plus, Trash2, Sun, Calendar, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CreateScheduleModal } from '../../components/CreateScheduleModal';
import { BusyHoursModal } from '../../components/BusyHoursModal';
import { AiPlannerModal } from '../../components/AiPlannerModal';
import { AIScheduleSuggestion } from '../../components/AIScheduleSuggestion';
import {
  days,
  dayShorts,
  colorMap,
  type AddTasksFromSchedule,
  type ScheduleBlock,
  type ScheduleFormData,
  type ScheduleTask,
} from '../../hooks/scheduleData';
import {
  useScheduleData,
  addScheduleBlock,
  updateScheduleBlock,
  deleteScheduleBlock,
} from '../../hooks/scheduleStore';
import { useCalendarData, isAiPlannedDay, dateKey } from '../../hooks/calendarStore';
import { useAiPlanner } from '../../hooks/useAiPlanner';
import { useTutorial } from '../../tutorial/tutorialStore';
import { tutorialSteps } from '../../tutorial/tutorialSteps';
import { DesktopPageHeader, DesktopEmpty } from '../DesktopUI';

interface DesktopTimetableProps {
  onAddTasks?: AddTasksFromSchedule;
}

export function DesktopTimetable({ onAddTasks }: DesktopTimetableProps) {
  const today = new Date();
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset);
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i),
  );

  const scheduleData = useScheduleData();
  const calendarData = useCalendarData();

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const hasTodaySchedule =
    (scheduleData[days[todayDayIndex]]?.length ?? 0) > 0 ||
    (calendarData[todayKey]?.length ?? 0) > 0;

  const { status: tutorialStatus, stepIndex: tutorialStepIndex } = useTutorial();
  const tutorialView =
    tutorialStatus === 'running' ? tutorialSteps[tutorialStepIndex]?.view : undefined;

  const [selectedIndex, setSelectedIndex] = useState(todayDayIndex);
  const [isTodayMode, setIsTodayMode] = useState(() => {
    if (tutorialView === 'week') return false;
    if (tutorialView === 'today') return true;
    return hasTodaySchedule;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleBlock | null>(null);
  const [editDay, setEditDay] = useState(days[todayDayIndex]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // While the tour is on the timetable intro/create/survey steps, keep the
  // weekly view so the + and "Khảo sát" targets are visible.
  useEffect(() => {
    if (tutorialView === 'week') setIsTodayMode(false);
    else if (tutorialView === 'today') {
      setIsTodayMode(true);
      setSelectedIndex(todayDayIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialView]);

  const selectedDay = days[selectedIndex];
  const selectedDate = weekDates[selectedIndex];
  const weekdaySchedule = scheduleData[selectedDay] || [];
  const selectedDateKey = dateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const dateSchedule = isTodayMode ? calendarData[selectedDateKey] || [] : [];
  const selectedSchedule = isTodayMode
    ? (isAiPlannedDay(selectedDateKey) ? dateSchedule : [...weekdaySchedule, ...dateSchedule])
    : weekdaySchedule;

  const planner = useAiPlanner(selectedDay, selectedSchedule, {
    onAddTasks,
    successMessage: 'Đã áp dụng lịch AI cho hôm nay',
    busyKey: selectedDay,
    onApplied: () => setIsTodayMode(true),
  });

  useEffect(() => {
    const openCreate = () => openAdd(selectedDay);
    const openBusy = () => planner.openSurvey();
    const openPlanner = () => planner.generate(['08:00–11:30']);
    window.addEventListener('tutorial:open-create', openCreate);
    window.addEventListener('tutorial:open-busy', openBusy);
    window.addEventListener('tutorial:open-planner', openPlanner);
    return () => {
      window.removeEventListener('tutorial:open-create', openCreate);
      window.removeEventListener('tutorial:open-busy', openBusy);
      window.removeEventListener('tutorial:open-planner', openPlanner);
    };
  }, [selectedDay]);

  const openAdd = (day: string) => {
    setEditDay(day);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (day: string, block: ScheduleBlock) => {
    setEditDay(day);
    setEditing(block);
    setModalOpen(true);
  };

  const handleSave = (data: ScheduleFormData) => {
    const block: ScheduleBlock = {
      id: data.id ?? Date.now().toString(),
      title: data.name,
      time: `${data.timeStart} - ${data.timeEnd}`,
      color: data.color,
      tasks: data.tasks,
    };
    if (data.id) updateScheduleBlock(editDay, data.id, block);
    else addScheduleBlock(editDay, block);

    if (data.tasks.length > 0 && onAddTasks) {
      onAddTasks(data.tasks, data.name, editDay, undefined, block.id);
    }
  };

  const renderBlock = (block: ScheduleBlock, day: string, compact = false) => {
    const c = colorMap[block.color] || colorMap['bg-blue-400'];
    return (
      <div
        key={block.id}
        role="button"
        tabIndex={0}
        onClick={() => (isTodayMode ? setExpandedId(expandedId === block.id ? null : block.id) : openEdit(day, block))}
        onKeyDown={e => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          isTodayMode ? setExpandedId(expandedId === block.id ? null : block.id) : openEdit(day, block);
        }}
        className={`group w-full text-left ${c.bg} rounded-2xl border ${c.border} p-3 shadow-sm hover:shadow-md transition-all cursor-pointer`}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-bold ${compact ? 'text-sm' : 'text-base'} ${c.text} truncate`}>{block.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[11px] font-semibold ${c.badge} text-white px-2 py-0.5 rounded-md`}>
                {block.time}
              </span>
              {block.tasks && block.tasks.length > 0 && (
                <span className="text-[11px] font-semibold bg-white/60 text-gray-600 px-2 py-0.5 rounded-full border border-white">
                  {block.tasks.length} nhiệm vụ
                </span>
              )}
            </div>
          </div>
          {isTodayMode ? (
            expandedId === block.id
              ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <button
              onClick={e => { e.stopPropagation(); deleteScheduleBlock(day, block.id); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-100 text-rose-400 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <DesktopPageHeader
        title={isTodayMode ? 'Hôm nay' : 'Lịch trình'}
        subtitle={isTodayMode ? 'Lịch trình hôm nay' : 'Lịch trình tuần của bạn'}
        actions={
          <>
            <button
              data-tour="tt-today"
              onClick={() => {
                setIsTodayMode(v => {
                  if (!v) setSelectedIndex(todayDayIndex);
                  return !v;
                });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                isTodayMode ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isTodayMode ? <Calendar className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {isTodayMode ? 'Xem cả tuần' : 'Hôm nay'}
            </button>
            {!isTodayMode && (
              <button
                data-tour="tt-survey"
                onClick={planner.openSurvey}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border border-dashed border-green-300 text-green-600 hover:bg-green-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                Khảo sát · {selectedDay}
              </button>
            )}
          </>
        }
      />

      <AnimatePresence mode="popLayout" initial={false}>
          {!isTodayMode ? (
            <motion.div
              key="week"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
        <div data-tour="tt-blocks" className="grid grid-cols-7 gap-3">
          {days.map((day, i) => {
            const blocks = scheduleData[day] || [];
            const isToday = i === todayDayIndex;
            const isSelected = i === selectedIndex;
            return (
              <div
                key={day}
                onClick={() => setSelectedIndex(i)}
                className={`rounded-3xl border-2 p-3 flex flex-col min-h-[500px] cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100'
                    : isToday
                    ? 'border-blue-200 bg-blue-50/60 hover:border-blue-300'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between px-1 pb-2.5 mb-2 border-b border-gray-100">
                  <div>
                    <p className={`text-xs font-bold ${isSelected || isToday ? 'text-blue-600' : 'text-gray-800'}`}>{dayShorts[i]}</p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {weekDates[i].getDate()}/{weekDates[i].getMonth() + 1}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); openAdd(day); }}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 flex-1">
                  {blocks.length > 0 ? (
                    blocks.map(block => renderBlock(block, day, true))
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); openAdd(day); }}
                      className="w-full py-8 rounded-2xl border border-dashed border-gray-200 text-gray-300 text-xs font-semibold hover:border-gray-300 hover:text-gray-400 transition-colors"
                    >
                      + Thêm
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
            </motion.div>
          ) : (
            <motion.div
              key="today"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
        <div>
          {/* Weekday strip + selected day schedule */}
          <div>
            <div className="grid grid-cols-7 gap-2 mb-5">
              {days.map((day, i) => {
                const isActive = i === selectedIndex;
                const isToday = i === todayDayIndex;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedIndex(i)}
                    className={`py-2 rounded-2xl flex flex-col items-center transition-all ${
                      isActive ? 'bg-blue-500' : isToday ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-white/80' : isToday ? 'text-blue-400' : 'text-gray-400'}`}>
                      {dayShorts[i]}
                    </span>
                    <span className={`text-sm font-bold ${isActive ? 'text-white' : isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                      {weekDates[i].getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div data-tour="tt-blocks" className="space-y-3">
              <AnimatePresence mode="wait" initial={false}>
                {selectedSchedule.length > 0 ? (
                  selectedSchedule.map((block, i) => (
                    <motion.div
                      key={`${selectedDay}-${block.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: 'easeInOut', delay: i * 0.03 }}
                    >
                      {renderBlock(block, selectedDay)}
                      <AnimatePresence>
                        {expandedId === block.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1">
                              <AIScheduleSuggestion
                                scheduleTitle={block.title}
                                scheduleTime={block.time}
                                day={selectedDay}
                                tasks={block.tasks?.map(t => t.title)}
                                analysis={block.analysis}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    key={`${selectedDay}-empty`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                  >
                    <DesktopEmpty label="Chưa có lịch cho ngày này" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
            </motion.div>
          )}
        </AnimatePresence>

      <CreateScheduleModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        day={editDay}
        initialData={editing}
      />

      <BusyHoursModal
        isOpen={planner.busyOpen}
        onClose={planner.closeSurvey}
        schedule={selectedSchedule}
        day={selectedDay}
        initialBusy={planner.busy}
        onBusyChange={planner.setBusy}
        onGeneratePlan={planner.generate}
      />

      <AiPlannerModal
        isOpen={planner.plannerOpen}
        onClose={planner.closePlanner}
        schedule={selectedSchedule}
        day={selectedDay}
        busy={planner.busy}
        onApply={planner.apply}
      />
    </div>
  );
}
