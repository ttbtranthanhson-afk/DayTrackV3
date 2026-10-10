import { Circle, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { useTasks, priorityConfig } from '../../hooks/useTasks';
import type { Task } from '../../hooks/useTasks';
import { DesktopPageHeader, DesktopAnimatedSwitch } from '../DesktopUI';

interface DesktopTasksProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export function DesktopTasks({ tasks: propTasks, onUpdateTasks }: DesktopTasksProps) {
  const {
    activeTab,
    setActiveTab,
    newTitle,
    setNewTitle,
    newPriority,
    setNewPriority,
    newDaily,
    setNewDaily,
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

  const groupFor = (p: 'high' | 'medium' | 'low') =>
    groupedByPriority.find(g => g.priority === p)?.tasks ?? [];

  return (
    <div>
      <DesktopPageHeader title={todayStr} subtitle="Quản lý nhiệm vụ của bạn" />

      {/* Week strip */}
      <div className="flex gap-2 mb-6">
        {weekDays.map(d => (
          <div
            key={d.date}
            className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all ${
              d.isToday ? 'bg-orange-400' : 'bg-white border border-gray-100'
            }`}
          >
            <span className={`text-[10px] font-semibold ${d.isToday ? 'text-white/80' : 'text-gray-400'}`}>{d.dayShort}</span>
            <span className={`text-sm font-bold ${d.isToday ? 'text-white' : 'text-gray-600'}`}>{d.date}</span>
          </div>
        ))}
      </div>

      {/* Add bar */}
      <form
        onSubmit={handleAddTask}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center gap-3 flex-wrap"
      >
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Thêm nhiệm vụ mới..."
          className="flex-1 min-w-[220px] px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-semibold text-gray-800 placeholder:text-gray-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <div className="flex gap-1.5">
          {(['high', 'medium', 'low'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setNewPriority(p)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                newPriority === p ? `${priorityConfig[p].badge} ring-2 ring-offset-1 ring-current` : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {priorityConfig[p].label.replace('Ưu tiên ', '')}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setNewDaily(v => !v)}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            newDaily ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
        >
          Hằng ngày
        </button>
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-sm shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Thêm
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {([['all', 'Tất cả'], ['active', 'Đang làm'], ['complete', 'Hoàn thành']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`mr-6 pb-2.5 text-sm font-semibold transition-colors relative ${
              activeTab === key ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            {label}
            {activeTab === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Priority columns */}
      <DesktopAnimatedSwitch id={activeTab}>
        <div className="grid grid-cols-3 gap-5">
        {(['high', 'medium', 'low'] as const).map(p => {
          const list = groupFor(p);
          return (
            <div key={p} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 min-h-[370px]">
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className={`w-2.5 h-2.5 rounded-full ${priorityConfig[p].bar}`} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{priorityConfig[p].label}</span>
                <span className="text-xs text-gray-400 ml-auto">{list.length}</span>
              </div>

              <div className="space-y-1">
                {list.length > 0 ? (
                  list.map(task => (
                    <div key={task.id} className="flex items-center group rounded-2xl hover:bg-gray-50 px-1 transition-colors">
                      <div
                        className={`w-1 self-stretch rounded-full mr-2.5 flex-shrink-0 ${task.completed ? 'bg-gray-200' : priorityConfig[task.priority].bar}`}
                        style={{ minHeight: '44px' }}
                      />
                      <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mr-2.5">
                        {task.completed
                          ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                          : <Circle className="w-5 h-5 text-gray-300" />}
                      </button>
                      <div className="flex-1 py-2.5 min-w-0">
                        {editingId === task.id ? (
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
                              else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                            }}
                            className="w-full px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />
                        ) : (
                          <button onClick={() => startEdit(task)} className="text-left w-full">
                            <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                              {task.title}
                            </p>
                            {(task.dueDate || task.scheduleName || task.recurrence === 'daily') && (
                              <div className="flex gap-1.5 mt-0.5 flex-wrap">
                                {task.recurrence === 'daily' && <span className="text-[11px] text-blue-400 font-semibold">Hằng ngày</span>}
                                {task.dueDate && <span className="text-[11px] text-gray-400">{task.dueDate}</span>}
                                {task.scheduleName && <span className="text-[11px] text-gray-400 truncate">· {task.scheduleName}</span>}
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-100 text-rose-400 transition-all ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-gray-300 font-semibold py-10">Trống</p>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </DesktopAnimatedSwitch>
    </div>
  );
}
