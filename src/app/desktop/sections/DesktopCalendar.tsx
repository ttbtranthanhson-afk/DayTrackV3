import { ChevronLeft, ChevronRight, Lock, Unlock, Trash2, Pencil, Search, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { CreateScheduleModal } from '../../components/CreateScheduleModal';
import { BusyHoursModal } from '../../components/BusyHoursModal';
import { AiPlannerModal } from '../../components/AiPlannerModal';
import { useCalendar, weekDays, holidays, monthNames } from '../../hooks/useCalendar';
import { useAiPlanner } from '../../hooks/useAiPlanner';
import type { ScheduleTask } from '../../hooks/scheduleData';
import { DesktopPageHeader } from '../DesktopUI';

interface DesktopCalendarProps {
  onAddTasks?: (tasks: ScheduleTask[], scheduleName: string, day: string, dateKey?: string) => void;
}

export function DesktopCalendar({ onAddTasks }: DesktopCalendarProps) {
  const {
    currentMonth,
    setCurrentMonth,
    currentYear,
    selectedDay,
    setSelectedDay,
    isModalOpen,
    editingBlock,
    openEditSchedule,
    openCreateSchedule,
    closeModal,
    offset,
    daysInMonth,
    isLocked,
    currentSchedules,
    weekdayForSelected,
    weekdaySchedule,
    getDaySchedules,
    todayDate,
    toggleLock,
    handleSaveSchedule,
    handleDeleteSchedule,
  } = useCalendar({ onAddTasks });

  const planner = useAiPlanner(weekdayForSelected, weekdaySchedule, {
    onAddTasks,
    successMessage: `Đã áp dụng lịch AI cho ${weekdayForSelected}`,
  });

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <DesktopPageHeader
        title="Lịch"
        subtitle={`${monthNames[currentMonth]} ${currentYear}`}
        actions={
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentMonth(m => Math.max(0, m - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMonth(m => Math.min(11, m + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
        {/* Month grid */}
        <div className="col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col min-h-0">
          <div className="grid grid-cols-7 mb-1.5">
            {weekDays.map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-1.5">{d}</div>
            ))}
          </div>
          <motion.div
            key={`${currentYear}-${currentMonth}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="grid grid-cols-7 grid-rows-6 gap-1 flex-1 min-h-0"
          >
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const isToday = day === todayDate;
              const isSelected = day === selectedDay;
              const holiday = holidays[day];
              const dayScheduleList = getDaySchedules(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-full min-h-0 p-1 rounded-xl flex flex-col items-center justify-start overflow-hidden transition-all border ${
                    isSelected
                      ? 'border-purple-300 bg-purple-50'
                      : isToday
                      ? 'border-transparent bg-purple-100'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${
                    isToday ? 'bg-gray-900 text-white font-bold' : isSelected ? 'text-purple-700 font-bold' : 'text-gray-700 font-medium'
                  }`}>
                    {day}
                  </span>
                  {holiday && (
                    <span className="text-[8px] text-rose-400 font-semibold truncate w-full text-center leading-tight">{holiday}</span>
                  )}
                  {dayScheduleList.length > 0 && !holiday && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayScheduleList.slice(0, 4).map((s, i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Selected day detail */}
        <div className="col-span-1 min-h-0">
          <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center gap-1 px-5 pt-4 pb-3 border-b border-gray-50">
              <span className="text-sm font-bold text-gray-800 flex-1">
                {selectedDay} tháng {currentMonth + 1}
              </span>
              <button
                onClick={openCreateSchedule}
                className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleLock(selectedDay)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  isLocked ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1"
            >
              {currentSchedules.length > 0 ? (
                currentSchedules.map(s => {
                  const editable = s.source === 'date';
                  return (
                    <div key={s.id} className="flex items-center group">
                      <div className={`w-1 self-stretch rounded-full mr-3 flex-shrink-0 ${s.color}`} style={{ minHeight: '40px' }} />
                      <div className="flex-1 py-2 border-b border-gray-50 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.time}</p>
                        {s.tasks && s.tasks.length > 0 && (
                          <p className="text-xs text-gray-400">{s.tasks.length} nhiệm vụ</p>
                        )}
                      </div>
                      {editable && (
                        <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditSchedule(s)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 text-purple-400">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteSchedule(s.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-rose-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-sm text-gray-300 font-semibold py-8">Chưa có lịch</p>
              )}
            </motion.div>

            <div className="p-4 pt-0">
              <button
                onClick={planner.openSurvey}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-dashed border-green-200 text-green-500 hover:bg-green-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm font-semibold">Khảo sát</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreateScheduleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveSchedule}
        day={`${selectedDay} tháng ${currentMonth + 1}, ${currentYear}`}
        initialData={editingBlock}
      />

      <BusyHoursModal
        isOpen={planner.busyOpen}
        onClose={planner.closeSurvey}
        schedule={weekdaySchedule}
        day={weekdayForSelected}
        onGeneratePlan={planner.generate}
      />

      <AiPlannerModal
        isOpen={planner.plannerOpen}
        onClose={planner.closePlanner}
        schedule={weekdaySchedule}
        day={weekdayForSelected}
        busy={planner.busy}
        onApply={planner.apply}
      />
    </div>
  );
}
