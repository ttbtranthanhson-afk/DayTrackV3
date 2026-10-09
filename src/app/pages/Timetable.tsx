import { Plus, Sparkles, Sun, Calendar, Trash2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { CreateScheduleModal } from '../components/CreateScheduleModal';
import { AIScheduleSuggestion } from '../components/AIScheduleSuggestion';
import { BusyHoursModal } from '../components/BusyHoursModal';
import { motion, AnimatePresence } from 'motion/react';
import { useTimetable, days, dayShorts, colorMap, type ScheduleTask } from '../hooks/useTimetable';

interface TimetableProps {
  onAddTasks?: (tasks: ScheduleTask[], scheduleName: string, day: string, dateKey?: string) => void;
}

export function Timetable({ onAddTasks }: TimetableProps) {
  const {
    currentDayIndex,
    setCurrentDayIndex,
    isModalOpen,
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
  } = useTimetable({ onAddTasks });

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isTodayMode ? 'Hôm nay' : 'Lịch học'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isTodayMode ? 'Gợi ý AI hàng ngày' : 'Lịch trình tuần của bạn'}
            </p>
          </div>
          <button
            onClick={() => setIsTodayMode(v => !v)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isTodayMode ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {isTodayMode ? <Calendar className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>

        {/* Week day strip */}
        <div className="flex gap-1 px-5 mb-5">
          {days.map((d, i) => {
            const isActive = i === currentDayIndex;
            const isToday = i === todayDayIndex;
            return (
              <button
                key={d}
                onClick={() => setCurrentDayIndex(i)}
                className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${
                  isActive ? 'bg-blue-500' : isToday ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className={`text-[10px] font-semibold mb-0.5 ${
                  isActive ? 'text-white/80' : isToday ? 'text-blue-400' : 'text-gray-400'
                }`}>{dayShorts[i]}</span>
                <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday && !isActive ? 'bg-blue-200' : ''
                }`}>
                  <span className={`text-xs font-bold ${
                    isActive ? 'text-white' : isToday ? 'text-blue-600' : 'text-gray-600'
                  }`}>{i + 2 <= 7 ? i + 16 : i + 16 - 7}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Day label */}
        <div className="px-5 mb-4">
          <span className="text-base font-bold text-gray-800">{currentDay}</span>
          {schedule.length > 0 && (
            <span className="ml-2 text-sm text-gray-400">{schedule.length} lịch</span>
          )}
        </div>

        {/* Schedule blocks */}
        <div className="px-5 space-y-3 mb-6">
          {schedule.length > 0 ? schedule.map(block => {
            const c = colorMap[block.color] || colorMap['bg-blue-400'];
            return (
              <div key={block.id} className="group">
                <div
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left ${c.bg} rounded-2xl border ${c.border} p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                  onClick={() => isTodayMode
                    ? setExpandedScheduleId(expandedScheduleId === block.id ? null : block.id)
                    : openEditSchedule(block)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    isTodayMode
                      ? setExpandedScheduleId(expandedScheduleId === block.id ? null : block.id)
                      : openEditSchedule(block);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Color dot */}
                    <div className={`w-3 h-3 rounded-full ${block.color} flex-shrink-0 mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-base ${c.text}`}>{block.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs font-semibold ${c.badge} text-white px-2.5 py-1 rounded-full`}>
                          {block.time}
                        </span>
                        {block.tasks && block.tasks.length > 0 && (
                          <span className="text-xs font-semibold bg-white/60 text-gray-600 px-2.5 py-1 rounded-full border border-white">
                            {block.tasks.length} nhiệm vụ
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isTodayMode && (
                        expandedScheduleId === block.id
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                      {!isTodayMode && (
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(block.id); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-100 text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Suggestions in Today Mode */}
                <AnimatePresence>
                  {isTodayMode && expandedScheduleId === block.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 mb-1">
                        <AIScheduleSuggestion
                          scheduleTitle={block.title}
                          scheduleTime={block.time}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }) : (
            <div className="text-center py-12">
              <p className="text-gray-300 font-semibold text-sm">Chưa có lịch cho ngày này</p>
            </div>
          )}
        </div>

        {/* Add button + Survey button */}
        {!isTodayMode ? (
          <div className="px-5 space-y-2">
            <button
              onClick={openCreateSchedule}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-blue-200 text-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-semibold">Tạo khối lịch trình mới</span>
            </button>
            <button
              onClick={() => setIsBusyOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-green-200 text-green-500 hover:bg-green-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-semibold">Khảo sát giờ bận</span>
            </button>
          </div>
        ) : (
          <div className="px-5">
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-blue-800">Gợi ý AI</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Lịch của bạn trông cân bằng! Hãy xem xét thêm 15 phút nghỉ giữa các lớp buổi sáng để tập trung tốt hơn.
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateScheduleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveSchedule}
        day={currentDay}
        initialData={editingBlock}
      />

      <BusyHoursModal
        isOpen={isBusyOpen}
        onClose={() => setIsBusyOpen(false)}
        schedule={schedule}
        day={currentDay}
      />
    </div>
  );
}
