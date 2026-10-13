import { Routes, Route, Navigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { DesktopLayout } from './DesktopLayout';
import { DesktopTimetable } from './sections/DesktopTimetable';
import { DesktopCalendar } from './sections/DesktopCalendar';
import { DesktopTasks } from './sections/DesktopTasks';
import { DesktopFocus } from './sections/DesktopFocus';
import { DesktopAchive } from './sections/DesktopAchive';
import { DesktopSettings } from './sections/DesktopSettings';
import { DesktopProfile } from './sections/DesktopProfile';
import { DesktopNotifications } from './sections/DesktopNotifications';
import { DesktopAppearance } from './sections/DesktopAppearance';
import { DesktopAbout } from './sections/DesktopAbout';
import { achievementGroupsData } from '../data/achievements';
import type { Task } from '../hooks/useTasks';
import type { ScheduleTask } from '../hooks/scheduleData';

interface DesktopUser {
  name: string;
  email: string;
  age?: string;
  job?: string;
  habits?: string;
  goals?: string;
  health?: string;
}

interface DesktopAppProps {
  userData: DesktopUser;
  onLogout: () => void;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  onAddTasks: (tasks: ScheduleTask[], scheduleName: string, day: string, dateKey?: string) => void;
}

export function DesktopApp({ userData, onLogout, tasks, onUpdateTasks, onAddTasks }: DesktopAppProps) {
  const location = useLocation();

  return (
    <DesktopLayout userData={userData} onLogout={onLogout}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/timetable" replace />} />
            <Route path="/timetable" element={<DesktopTimetable onAddTasks={onAddTasks} />} />
            <Route path="/calendar" element={<DesktopCalendar onAddTasks={onAddTasks} />} />
            <Route path="/tasks" element={<DesktopTasks tasks={tasks} onUpdateTasks={onUpdateTasks} />} />
            <Route path="/focus" element={<DesktopFocus />} />
            <Route path="/achive" element={<DesktopAchive />} />
            <Route path="/settings" element={<DesktopSettings userData={userData} onLogout={onLogout} />} />
            <Route path="/profile" element={<DesktopProfile userData={userData} achievements={achievementGroupsData} />} />
            <Route path="/notifications" element={<DesktopNotifications />} />
            <Route path="/appearance" element={<DesktopAppearance />} />
            <Route path="/about" element={<DesktopAbout />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </DesktopLayout>
  );
}
