import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { useNotificationScheduler } from './hooks/useNotificationScheduler';
import { useAppTheme } from './hooks/useAppTheme';
import { BottomNav } from './components/BottomNav';
import { FocusBubble } from './components/FocusBubble';
import { useIsDesktop } from './desktop/useIsDesktop';
import { DesktopApp } from './desktop/DesktopApp';
import { DesktopLogin } from './desktop/DesktopLogin';
import { Timetable } from './pages/Timetable';
import { Calendar } from './pages/Calendar';
import { Tasks } from './pages/Tasks';
import { Focus } from './pages/Focus';
import { Achive } from './pages/Achive';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { Appearance } from './pages/Appearance';
import { About } from './pages/About';
import { achievementGroupsData } from './data/achievements';
import { syncAchievementsWithTasks } from './hooks/achievementStore';
import { pruneCalendarData } from './hooks/calendarStore';
import { pruneBusyData } from './hooks/busyStore';
import { days, type ScheduleTask } from './hooks/scheduleData';
import { recordVisit, syncAchievementStats } from './hooks/achievementStats';
import type { BlockType } from '../../shared/ai';
import { TutorialLayer } from './tutorial/TutorialLayer';
import {
  activateAccount,
  clearActiveAccount,
  hasActiveAccount,
  getAccountItem,
  setAccountItem,
} from './hooks/accountStorage';

const USER_DATA_KEY = 'daytrack_user_data';
const TASKS_KEY = 'daytrack_tasks';

interface UserData {
  name: string;
  email: string;
  age?: string;
  job?: string;
  habits?: string;
  goals?: string;
  health?: string;
  mental?: string;
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
  source?: string;
  scheduleName?: string;
  scheduleTaskId?: string;
  scheduleBlockId?: string;
  blockType?: BlockType;
  weekday?: number;
  dateKey?: string;
  recurrence?: 'daily';
  completedDate?: string;
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' });
  const [globalTasks, setGlobalTasks] = useState<Task[]>([]);
  const location = useLocation();
  const isDesktop = useIsDesktop();

  useNotificationScheduler();
  useAppTheme();

  useEffect(() => {
    pruneCalendarData();
    pruneBusyData();

    if (hasActiveAccount()) {
      const savedUserData = getAccountItem(USER_DATA_KEY);
      if (savedUserData) {
        setUserData(JSON.parse(savedUserData));
        setIsLoggedIn(true);

        const savedTasks = getAccountItem(TASKS_KEY);
        if (savedTasks) {
          setGlobalTasks(JSON.parse(savedTasks));
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) recordVisit();
  }, [isLoggedIn]);

  useEffect(() => {
    const handler = () => {
      const savedTasks = getAccountItem(TASKS_KEY);
      setGlobalTasks(savedTasks ? JSON.parse(savedTasks) : []);
      const savedUserData = getAccountItem(USER_DATA_KEY);
      if (savedUserData) setUserData(JSON.parse(savedUserData));
    };
    window.addEventListener('daytrack:data-refresh', handler);
    return () => window.removeEventListener('daytrack:data-refresh', handler);
  }, []);

  const handleLogin = (data: UserData) => {
    activateAccount(data.email);

    const savedUserData = getAccountItem(USER_DATA_KEY);
    let profile = data;
    if (savedUserData) {
      try {
        profile = JSON.parse(savedUserData) as UserData;
      } catch {
        profile = data;
      }
    } else {
      setAccountItem(USER_DATA_KEY, JSON.stringify(data));
    }

    setUserData(profile);
    setIsLoggedIn(true);

    const savedTasks = getAccountItem(TASKS_KEY);
    setGlobalTasks(savedTasks ? JSON.parse(savedTasks) : []);
  };

  const handleLogout = () => {
    clearActiveAccount();
    setIsLoggedIn(false);
    setUserData({ name: '', email: '' });
    setGlobalTasks([]);
  };

  const handleAddTasksFromSchedule = (
    tasks: ScheduleTask[],
    scheduleName: string,
    day: string,
    dateKey?: string,
    scheduleBlockId?: string,
    blockType?: BlockType,
  ) => {
    const weekday = days.indexOf(day);
    const next = [...globalTasks];

    tasks.forEach(task => {
      const existingIndex = next.findIndex(t => t.scheduleTaskId === task.id);
      if (existingIndex >= 0) {
        next[existingIndex] = { ...next[existingIndex], title: task.title, priority: task.priority };
      } else {
        next.push({
          id: Date.now().toString() + Math.random(),
          title: task.title,
          priority: task.priority,
          completed: false,
          dueDate: day,
          source: 'schedule',
          scheduleName: scheduleName,
          scheduleTaskId: task.id,
          scheduleBlockId: scheduleBlockId,
          blockType: blockType,
          ...(dateKey ? { dateKey } : weekday >= 0 ? { weekday } : {}),
        });
      }
    });

    setGlobalTasks(next);
    setAccountItem(TASKS_KEY, JSON.stringify(next));
  };

  const handleUpdateTasks = (tasks: Task[]) => {
    syncAchievementsWithTasks(globalTasks, tasks);
    syncAchievementStats(globalTasks, tasks);
    setGlobalTasks(tasks);
    setAccountItem(TASKS_KEY, JSON.stringify(tasks));
  };

  const showBottomNav = isLoggedIn;

  if (!isLoggedIn) {
    return isDesktop
      ? <DesktopLogin onLogin={handleLogin} />
      : <Login onLogin={handleLogin} />;
  }

  if (isDesktop) {
    return (
      <div className="size-full">
        <DesktopApp
          userData={userData}
          onLogout={handleLogout}
          tasks={globalTasks}
          onUpdateTasks={handleUpdateTasks}
          onAddTasks={handleAddTasksFromSchedule}
        />
        <FocusBubble />
        <TutorialLayer enabled={isLoggedIn} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <div className="size-full">
      <Routes>
        <Route path="/" element={<Navigate to="/timetable" replace />} />
        <Route path="/timetable" element={<Timetable onAddTasks={handleAddTasksFromSchedule} />} />
        <Route path="/calendar" element={<Calendar onAddTasks={handleAddTasksFromSchedule} />} />
        <Route path="/tasks" element={<Tasks tasks={globalTasks} onUpdateTasks={handleUpdateTasks} />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/achive" element={<Achive />} />
        <Route path="/settings" element={<Settings userData={userData} onLogout={handleLogout} />} />
        <Route path="/profile" element={<Profile userData={userData} achievements={achievementGroupsData} />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/appearance" element={<Appearance />} />
        <Route path="/about" element={<About />} />
      </Routes>
      {showBottomNav && <BottomNav />}
      <FocusBubble />
      <TutorialLayer enabled={isLoggedIn} />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}