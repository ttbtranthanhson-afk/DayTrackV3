import { useRef, useEffect } from 'react';
import { Calendar, CheckSquare, Clock, Award, CalendarDays, Settings, Plus, Play } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';

const navItems = [
  { path: '/timetable', icon: CalendarDays, label: 'Lịch trình' },
  { path: '/calendar',  icon: Calendar,    label: 'Lịch'     },
  { path: '/tasks',     icon: CheckSquare, label: 'Nhiệm vụ' },
  { path: '/focus',     icon: Clock,       label: 'Tập trung'},
  { path: '/achive',    icon: Award,       label: 'Thành tựu'},
  { path: '/settings',  icon: Settings,    label: 'Cài đặt'  },
];

const pageActions: Record<string, { icon: any; bg: string }> = {
  '/timetable': { icon: Plus, bg: 'bg-blue-500'   },
  '/calendar':  { icon: Plus, bg: 'bg-purple-500' },
  '/tasks':     { icon: Plus, bg: 'bg-orange-500' },
  '/focus':     { icon: Play, bg: 'bg-green-500'  },
};

export function BottomNav() {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activePath =
    location.pathname === '/' ? '/timetable' : location.pathname;
  const activeIdx = navItems.findIndex(item => item.path === activePath);
  const action = pageActions[activePath];

  // Auto-scroll so active tab is always visible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || activeIdx < 0) return;
    const itemWidth = el.offsetWidth / 4;
    // Keep active item as the 2nd visible item where possible
    const target = Math.max(0, (activeIdx - 1) * itemWidth);
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, [activePath]);

  const fireAction = () =>
    window.dispatchEvent(new CustomEvent('nav:quick-action'));

  const ActionIcon = action ? action.icon : Plus;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md flex items-center gap-2.5">

        {/* ── Left: 4-visible scrollable nav card ── */}
        <div className="flex-1 bg-white rounded-[28px] shadow-xl shadow-black/[0.08] border border-gray-100 px-1.5 py-1.5 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {navItems.map((item) => {
              const isActive = item.path === activePath;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-tour={`nav-${item.path.slice(1)}`}
                  className="flex-shrink-0 flex justify-center"
                  style={{ width: '25%', scrollSnapAlign: 'start' }}
                >
                  <div
                    className={`flex flex-col items-center gap-1 w-full py-2 px-1 rounded-2xl transition-all duration-200 ${
                      isActive ? 'bg-gray-200/80' : 'hover:bg-gray-100/60'
                    }`}
                  >
                    <Icon
                      className="w-6 h-6 text-gray-900"
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    <span
                      className={`text-[9px] leading-none text-gray-900 text-center ${
                        isActive ? 'font-bold' : 'font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Right: contextual action button ── */}
        <motion.div
          initial={false}
          animate={{ width: action ? 62 : 0, opacity: action ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="flex-shrink-0 overflow-hidden"
          style={{ pointerEvents: action ? 'auto' : 'none' }}
        >
          <button
            onClick={fireAction}
            data-tour="nav-action"
            className={`w-[62px] h-[62px] ${action ? action.bg : 'bg-gray-300'} rounded-[22px] shadow-xl shadow-black/15 flex items-center justify-center active:scale-95 transition-all duration-300`}
          >
            <ActionIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
