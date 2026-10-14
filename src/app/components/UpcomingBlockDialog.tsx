import { CalendarClock, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ScheduleBlock } from '../hooks/scheduleData';

export function UpcomingBlockDialog({
  block,
  onSkip,
  onStart,
}: {
  block: ScheduleBlock | null;
  onSkip: () => void;
  onStart: () => void;
}) {
  return (
    <AnimatePresence>
      {block && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={onSkip}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-green-600" />
              </div>
              <button
                onClick={onSkip}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">{block.title}</h3>
            <p className="text-sm text-gray-500 mb-1">{block.time}</p>

            <p className="text-sm text-gray-700 leading-relaxed mt-3 mb-5">
              Lịch này chưa đến giờ. Bạn có thể bỏ qua hoặc thực hiện lịch này ngay bây giờ.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Bỏ qua
              </button>
              <button
                onClick={onStart}
                className="flex-1 py-2.5 rounded-xl bg-green-500 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                Thực hiện lịch này
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}