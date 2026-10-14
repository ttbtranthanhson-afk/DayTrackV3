import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { useFocusState, toggleTimer, resetTimer } from '../hooks/focusStore';
import { useIsDesktop } from '../desktop/useIsDesktop';

function formatClock(total: number, showHours: boolean) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (showHours) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function FocusBubble() {
  const state = useFocusState();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [expanded, setExpanded] = useState(false);

  const active = state.isRunning || state.currentTime > 0;
  const onFocusPage = location.pathname === '/focus';
  const hidden = !active || onFocusPage;

  useEffect(() => {
    if (hidden) setExpanded(false);
  }, [hidden]);

  if (hidden) return null;

  const showHours = Math.floor(state.currentTime / 3600) > 0;
  const timeText = formatClock(state.currentTime, showHours);
  const songLabel = state.currentSong
    ? state.currentSong.title
    : state.isRunning
      ? 'Đang tập trung'
      : 'Tạm dừng';

  return (
    <div className={`fixed z-[140] ${isDesktop ? 'bottom-6 right-6' : 'bottom-28 right-4'}`}>
      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="flex items-center gap-3 bg-white/95 backdrop-blur rounded-3xl shadow-2xl shadow-black/15 border border-gray-100 pl-4 pr-3 py-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-lg font-bold text-gray-900 tabular-nums leading-none">{timeText}</p>
              <p className="text-[11px] text-gray-500 truncate max-w-[150px] mt-1">{songLabel}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={toggleTimer}
                title={state.isRunning ? 'Tạm dừng' : 'Tiếp tục'}
                className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                {state.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                title="Kết thúc"
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  navigate('/focus');
                }}
                title="Mở mục Tập trung"
                className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            type="button"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={() => setExpanded(true)}
            title="Đồng hồ tập trung"
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-xl shadow-green-500/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Clock className="w-6 h-6 text-white" />
            {state.isRunning && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
