import { ChevronLeft, ChevronRight, Lock, Unlock, Plus, Trash2, Pencil } from 'lucide-react';
import { CreateScheduleModal } from '../components/CreateScheduleModal';
import { useCalendar, weekDays, holidays, monthNames } from '../hooks/useCalendar';
import type { ScheduleTask } from '../hooks/scheduleData';

interface CalendarProps {
  onAddTasks?: (tasks: ScheduleTask[], scheduleName: string, day: string, dateKey?: string) => void;
}

export function Calendar({ onAddTasks }: CalendarProps) {
  const {
    currentMonth,
    setCurrentMonth,
    currentYear,
    selectedDay,
    setSelectedDay,
    isModalOpen,
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
    toggleLock,
    handleSaveSchedule,
    handleDeleteSchedule,
  } = useCalendar({ onAddTasks });

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-12 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{monthNames[currentMonth]}</h1>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-5 mt-4 mb-1">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-5">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isToday = day === todayDate;
            const isSelected = day === selectedDay;
            const holiday = holidays[day];
            const dayScheduleList = getDaySchedules(day);
            const hasSchedule = dayScheduleList.length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className="aspect-square flex flex-col items-center justify-center relative py-0.5"
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                  isToday
                    ? 'bg-gray-900 text-white'
                    : isSelected
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                  <span className={`text-sm ${isToday || isSelected ? 'font-bold' : 'font-medium'}`}>{day}</span>
                </div>
                {holiday && (
                  <span className="text-[8px] text-rose-400 font-semibold leading-tight text-center px-0.5 truncate w-full">
                    {holiday}
                  </span>
                )}
                {hasSchedule && !holiday && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayScheduleList.slice(0, 3).map((s, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full ${s.color}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-5 mt-4 border-t border-gray-100" />

        {/* Selected day schedule */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-base font-bold text-gray-900">
                {selectedDay} tháng {currentMonth + 1}, {currentYear}
              </span>
              {isLocked && (
                <span className="ml-2 text-xs text-purple-500 font-semibold">· Đã khóa</span>
              )}
            </div>
            <button
              onClick={() => toggleLock(selectedDay)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isLocked ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>

          {/* Schedule list */}
          <div className="space-y-px mb-4">
            {currentSchedules.length > 0 ? currentSchedules.map(s => {
              const editable = s.source === 'date';
              return (
                <div
                  key={s.id}
                  role={editable ? 'button' : undefined}
                  tabIndex={editable ? 0 : undefined}
                  onClick={editable ? () => openEditSchedule(s) : undefined}
                  onKeyDown={editable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openEditSchedule(s);
                    }
                  } : undefined}
                  className={`flex items-center group ${editable ? 'cursor-pointer' : ''}`}
                >
                  <div className={`w-1 self-stretch rounded-full mr-3 flex-shrink-0 ${s.color}`}
                    style={{ minHeight: '48px' }} />
                  <div className="flex-1 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.time}</p>
                    {s.tasks && s.tasks.length > 0 && (
                      <p className="text-xs text-gray-400">{s.tasks.length} nhiệm vụ</p>
                    )}
                  </div>
                  {editable && (
                    <div className="flex items-center ml-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditSchedule(s); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 text-purple-400 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(s.id); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-rose-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-300 font-semibold">Chưa có lịch</p>
              </div>
            )}
          </div>

          <button
            onClick={openCreateSchedule}
            className="w-full flex items-center gap-2 py-3 px-4 rounded-2xl border border-dashed border-purple-200 text-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Thêm lịch trình</span>
          </button>
        </div>
      </div>

      <CreateScheduleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveSchedule}
        day={`${selectedDay} tháng ${currentMonth + 1}, ${currentYear}`}
        initialData={editingBlock}
      />
    </div>
  );
}
