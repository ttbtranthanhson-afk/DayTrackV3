import { useState, useEffect } from 'react';
import { X, Clock, Plus, Tag, Trash2, Check, CalendarPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { colorOptions, normalizeTasks, taskPriorities, type ScheduleTask, type TaskPriority } from '../hooks/scheduleData';
import { priorityConfig } from '../hooks/useTasks';
import type { ScheduleBlock, ScheduleFormData } from '../hooks/useTimetable';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: ScheduleFormData) => void;
  day: string;
  initialData?: ScheduleBlock | null;
}

const DEFAULT_START = '09:00';
const DEFAULT_END = '10:00';

function padTime(time: string): string {
  const [h, m] = (time || '').trim().split(':');
  return `${(h || '00').padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
}

function parseTimeRange(range: string): { timeStart: string; timeEnd: string } {
  const [start, end] = (range || '').split(' - ');
  return { timeStart: padTime(start), timeEnd: padTime(end) };
}

export function CreateScheduleModal({ isOpen, onClose, onSave, day, initialData }: CreateScheduleModalProps) {
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState('');
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [currentTask, setCurrentTask] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [timeStart, setTimeStart] = useState(DEFAULT_START);
  const [timeEnd, setTimeEnd] = useState(DEFAULT_END);
  const [color, setColor] = useState(colorOptions[0].value);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const { timeStart: start, timeEnd: end } = parseTimeRange(initialData.time);
      setName(initialData.title);
      setTasks(normalizeTasks(initialData.tasks));
      setTimeStart(start);
      setTimeEnd(end);
      setColor(initialData.color || colorOptions[0].value);
    } else {
      setName('');
      setTasks([]);
      setTimeStart(DEFAULT_START);
      setTimeEnd(DEFAULT_END);
      setColor(colorOptions[0].value);
    }
    setCurrentTask('');
    setNewPriority('medium');
    setEditingIndex(null);
    setEditingTitle('');
  }, [isOpen, initialData?.id]);

  const handleAddTask = () => {
    if (currentTask.trim()) {
      setTasks([...tasks, { id: Date.now().toString() + Math.random(), title: currentTask.trim(), priority: newPriority }]);
      setCurrentTask('');
    }
  };

  const handleChangeTaskPriority = (index: number, priority: TaskPriority) => {
    setTasks(tasks.map((task, i) => (i === index ? { ...task, priority } : task)));
  };

  const startTaskEdit = (index: number) => {
    setEditingIndex(index);
    setEditingTitle(tasks[index].title);
  };

  const cancelTaskEdit = () => {
    setEditingIndex(null);
    setEditingTitle('');
  };

  const commitTaskEdit = () => {
    if (editingIndex === null) return;
    const title = editingTitle.trim();
    if (title) {
      setTasks(tasks.map((task, i) => (i === editingIndex ? { ...task, title } : task)));
    }
    setEditingIndex(null);
    setEditingTitle('');
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
    if (editingIndex !== null) {
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingTitle('');
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: initialData?.id, name, tasks, timeStart, timeEnd, color });
    setName('');
    setTasks([]);
    setCurrentTask('');
    setTimeStart(DEFAULT_START);
    setTimeEnd(DEFAULT_END);
    setColor(colorOptions[0].value);
    setEditingIndex(null);
    setEditingTitle('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
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
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <CalendarPlus className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      {isEditing ? 'Sửa khối lịch trình' : 'Tạo khối lịch trình'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">{day}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Tên khối lịch trình
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: Môn Toán"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-800 placeholder:text-gray-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                      required
                    />
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Tasks */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Nhiệm vụ
                  </label>
                  <div className="rounded-2xl border border-gray-200 p-3 space-y-3">
                    {/* Add task input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={currentTask}
                        onChange={(e) => setCurrentTask(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTask();
                          }
                        }}
                        placeholder="Nhập nhiệm vụ..."
                        className="w-full pl-4 pr-12 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddTask}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Priority for new task */}
                    <div className="flex gap-2">
                      {taskPriorities.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewPriority(p)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            newPriority === p
                              ? `${priorityConfig[p].badge} ring-2 ring-offset-1 ring-current`
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {priorityConfig[p].label.replace('Ưu tiên ', '')}
                        </button>
                      ))}
                    </div>

                    {/* Task list */}
                    {tasks.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto pt-1">
                        {tasks.map((task, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-2.5 group"
                          >
                            <div className="flex items-center gap-2">
                              {editingIndex === index ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      commitTaskEdit();
                                    } else if (e.key === 'Escape') {
                                      cancelTaskEdit();
                                    }
                                  }}
                                  onBlur={commitTaskEdit}
                                  className="flex-1 min-w-0 text-sm font-medium text-gray-700 bg-white rounded-lg border border-blue-200 px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startTaskEdit(index)}
                                  title="Bấm để sửa tên nhiệm vụ"
                                  className="flex-1 min-w-0 text-left text-sm font-medium text-gray-700 truncate hover:text-blue-500 transition-colors"
                                >
                                  {task.title}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveTask(index)}
                                className="p-1 rounded-lg hover:bg-red-100 transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              {taskPriorities.map(p => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => handleChangeTaskPriority(index, p)}
                                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                    task.priority === p
                                      ? `${priorityConfig[p].badge} ring-2 ring-offset-1 ring-current`
                                      : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-100'
                                  }`}
                                >
                                  {priorityConfig[p].label.replace('Ưu tiên ', '')}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Chọn mức ưu tiên rồi nhấn + để thêm nhiệm vụ</p>
                </div>

                {/* Time Range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Thời gian
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[11px] text-gray-400 mb-1">Bắt đầu</span>
                      <div className="relative">
                        <input
                          type="time"
                          value={timeStart}
                          onChange={(e) => setTimeStart(e.target.value)}
                          className="w-full pl-11 pr-3 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100 transition-all"
                          required
                        />
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-400 mb-1">Kết thúc</span>
                      <div className="relative">
                        <input
                          type="time"
                          value={timeEnd}
                          onChange={(e) => setTimeEnd(e.target.value)}
                          className="w-full pl-11 pr-3 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                          required
                        />
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Màu chủ đề
                  </label>
                  <div className="flex gap-2.5">
                    {colorOptions.map((option) => {
                      const isSelected = color === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-label={`Chọn màu ${option.value}`}
                          aria-pressed={isSelected}
                          onClick={() => setColor(option.value)}
                          className={`w-9 h-9 rounded-xl ${option.swatch} flex items-center justify-center transition-all ${
                            isSelected
                              ? `border-4 ${option.ring} scale-110 shadow-md`
                              : 'border-2 border-gray-200 hover:scale-110'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-gray-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                  >
                    {isEditing ? 'Lưu' : 'Tạo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
