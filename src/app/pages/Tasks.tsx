import { Circle, CheckCircle2, X, Tag, Trash2 } from 'lucide-react';
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
    newDaily,
    setNewDaily,
    inputRef,
    todayStr,
    weekDays,
    groupedByPriority,
    toggleTask,
    handleAddTask,
    editingId,
    editingTitle,
    setEditingTitle,
    startEdit,
    cancelEdit,
    commitEdit,
    handleDeleteTask,
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
                    <div className="flex-1 py-3 border-b border-gray-50 min-w-0">
                      {editingId === task.id ? (
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitEdit();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                          className="w-full px-2 py-1 -ml-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(task)}
                          className="text-left w-full"
                        >
                          <p className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                            {task.title}
                          </p>
                          {(task.dueDate || task.scheduleName || task.recurrence === 'daily') && (
                            <div className="flex gap-2 mt-0.5 flex-wrap">
                              {task.recurrence === 'daily' && <span className="text-xs text-blue-400 font-semibold">Hằng ngày</span>}
                              {task.dueDate && <span className="text-xs text-gray-400">{task.dueDate}</span>}
                              {task.scheduleName && <span className="text-xs text-gray-400">· {task.scheduleName}</span>}
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-100 text-rose-400 transition-all ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowAddModal(false)}
            />
            {/* Centered card */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Thêm nhiệm vụ</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{todayStr}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleAddTask} className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Tên nhiệm vụ
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="VD: Ôn tập Toán"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-800 placeholder:text-gray-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Priority selector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Mức ưu tiên
                    </label>
                    <div className="flex gap-2">
                      {(['high', 'medium', 'low'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewPriority(p)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            newPriority === p
                              ? `${priorityConfig[p].badge} ring-2 ring-offset-1 ring-current`
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {priorityConfig[p].label.replace('Ưu tiên ', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily recurrence */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Diễn ra hằng ngày
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={newDaily}
                      aria-label="Diễn ra hằng ngày"
                      onClick={() => setNewDaily(v => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        newDaily ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          newDaily ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!newTitle.trim()}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Thêm nhiệm vụ
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
