import { Circle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks, priorityConfig } from '../hooks/useTasks';
import type { Task } from '../hooks/useTasks';

interface TasksProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export function Tasks({ tasks: propTasks, onUpdateTasks }: TasksProps) {
  const {
    activeTab,
    setActiveTab,
    showAddModal,
    setShowAddModal,
    newTitle,
    setNewTitle,
    newPriority,
    setNewPriority,
    inputRef,
    todayStr,
    weekDays,
    groupedByPriority,
    toggleTask,
    handleAddTask,
  } = useTasks({ tasks: propTasks, onUpdateTasks });

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-12 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">{todayStr}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Quản lý nhiệm vụ của bạn</p>
        </div>

        {/* Week strip */}
        <div className="flex gap-1 px-5 mb-5">
          {weekDays.map(d => (
            <div key={d.date} className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${
              d.isToday ? 'bg-orange-400' : 'bg-gray-50'
            }`}>
              <span className={`text-[10px] font-semibold mb-0.5 ${d.isToday ? 'text-white/80' : 'text-gray-400'}`}>
                {d.dayShort}
              </span>
              <span className={`text-sm font-bold ${d.isToday ? 'text-white' : 'text-gray-600'}`}>
                {d.date}
              </span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-100 px-5 mb-5">
          {([['all', 'Tất cả'], ['active', 'Đang làm'], ['complete', 'Hoàn thành']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`mr-5 pb-2.5 text-sm font-semibold transition-colors relative ${
                activeTab === key ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {label}
              {activeTab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tasks grouped by priority */}
        <div className="px-5 space-y-6">
          {groupedByPriority.length > 0 ? groupedByPriority.map(group => (
            <div key={group.priority}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${priorityConfig[group.priority].bar}`} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {priorityConfig[group.priority].label}
                </span>
                <span className="text-xs text-gray-400">({group.tasks.length})</span>
              </div>
              <div className="space-y-px">
                {group.tasks.map(task => (
                  <div key={task.id} className="flex items-center group">
                    <div className={`w-1 self-stretch rounded-full mr-3 flex-shrink-0 ${
                      task.completed ? 'bg-gray-200' : priorityConfig[task.priority].bar
                    }`} style={{ minHeight: '48px' }} />
                    <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mr-3">
                      {task.completed
                        ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                        : <Circle className="w-5 h-5 text-gray-300" />}
                    </button>
                    <div className="flex-1 py-3 border-b border-gray-50">
                      <p className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      {(task.dueDate || task.scheduleName) && (
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          {task.dueDate && <span className="text-xs text-gray-400">{task.dueDate}</span>}
                          {task.scheduleName && <span className="text-xs text-gray-400">· {task.scheduleName}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="text-center py-16">
              <p className="text-gray-300 font-semibold">Không có nhiệm vụ nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick-add modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setShowAddModal(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-5 pt-5 pb-10 max-w-md mx-auto"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Thêm nhiệm vụ</h3>
                <button onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <input
                  ref={inputRef}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Tên nhiệm vụ..."
                  className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-semibold text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                />

                {/* Priority selector */}
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        newPriority === p
                          ? `${priorityConfig[p].badge} ring-2 ring-offset-1 ring-current`
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {priorityConfig[p].label.replace('Ưu tiên ', '')}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="w-full py-4 bg-orange-400 text-white rounded-2xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-500 transition-colors"
                >
                  Thêm nhiệm vụ
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
