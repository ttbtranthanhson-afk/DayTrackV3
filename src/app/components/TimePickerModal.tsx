import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Timer } from 'lucide-react';
import { parseClock } from '../hooks/notificationService';

interface TimePickerModalProps {
  open: boolean;
  title: string;
  value: string;
  onClose: () => void;
  onSave: (time: string) => void;
}

function clockColumn(
  label: string,
  range: number[],
  value: number,
  onChange: (v: number) => void
) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2">
        {label}
      </p>
      <div className="h-56 overflow-y-auto rounded-2xl bg-gray-50 border border-gray-100 px-2 py-2 space-y-1">
        {range.map(v => {
          const selected = v === value;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`w-full py-1.5 rounded-lg text-center text-sm font-bold transition-colors ${
                selected ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {String(v).padStart(2, '0')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimePickerModal({ open, title, value, onClose, onSave }: TimePickerModalProps) {
  const initial = parseClock(value) || { h: 8, m: 0 };
  const [hours, setHours] = useState(initial.h);
  const [minutes, setMinutes] = useState(initial.m);

  const close = () => {
    const parsed = parseClock(value) || { h: 8, m: 0 };
    setHours(parsed.h);
    setMinutes(parsed.m);
    onClose();
  };

  const save = () => {
    onSave(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={close}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-md pointer-events-auto shadow-xl"
            >
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Chọn giờ và phút</p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4">
                  {clockColumn('Giờ', Array.from({ length: 24 }, (_, i) => i), hours, setHours)}
                  <span className="text-3xl font-bold text-gray-300">:</span>
                  {clockColumn('Phút', Array.from({ length: 60 }, (_, i) => i), minutes, setMinutes)}
                </div>

                <div className="flex items-center justify-center gap-2 mt-5">
                  <span className="text-3xl font-bold text-gray-900 tabular-nums">
                    {String(hours).padStart(2, '0')}:
                    {String(minutes).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex gap-3 pt-5">
                  <button
                    onClick={close}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={save}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}