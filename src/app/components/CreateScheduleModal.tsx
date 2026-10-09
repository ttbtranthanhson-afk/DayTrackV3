import { useState } from 'react';
import { X, Clock, Plus, Tag, Trash2 } from 'lucide-react';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: {
    name: string;
    tasks: string[];
    timeStart: string;
    timeEnd: string;
  }) => void;
  day: string;
}

export function CreateScheduleModal({ isOpen, onClose, onSave, day }: CreateScheduleModalProps) {
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState('');
  const [timeStart, setTimeStart] = useState('09:00');
  const [timeEnd, setTimeEnd] = useState('10:00');

  const handleAddTask = () => {
    if (currentTask.trim()) {
      setTasks([...tasks, currentTask.trim()]);
      setCurrentTask('');
    }
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, tasks, timeStart, timeEnd });
    // Reset form
    setName('');
    setTasks([]);
    setCurrentTask('');
    setTimeStart('09:00');
    setTimeEnd('10:00');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-xl text-gray-800">Tạo khối lịch trình</h2>
            <p className="text-sm text-gray-500">{day}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Tên <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Môn Toán"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                required
              />
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Tasks Input */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Nhiệm vụ</label>

            {/* Add Task Input */}
            <div className="relative mb-3">
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
                placeholder="Nhập nhiệm vụ và nhấn +"
                className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-400 text-white rounded-xl flex items-center justify-center hover:bg-purple-500 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Tasks List */}
            {tasks.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-purple-50 rounded-xl p-3 group"
                  >
                    <span className="flex-1 text-sm text-gray-700">{task}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time Start */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Thời gian bắt đầu <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-300 transition-all"
                  required
                />
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Time End */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Thời gian kết thúc <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                  required
                />
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-3">Màu chủ đề</label>
            <div className="flex gap-3">
              {[
                'bg-blue-100 border-blue-200',
                'bg-purple-100 border-purple-200',
                'bg-green-100 border-green-200',
                'bg-orange-100 border-orange-200',
                'bg-pink-100 border-pink-200',
                'bg-yellow-100 border-yellow-200',
              ].map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className={`w-10 h-10 rounded-xl ${color} border-2 hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Tạo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
