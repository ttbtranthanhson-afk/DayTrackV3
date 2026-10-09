import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { BottomNav } from './components/BottomNav';
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

interface UserData {
  name: string;
  email: string;
  age?: string;
  job?: string;
  habits?: string;
  goals?: string;
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
  source?: string;
  scheduleName?: string;
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' });
  const [globalTasks, setGlobalTasks] = useState<Task[]>([]);
  const location = useLocation();

  useEffect(() => {
    const savedUserData = localStorage.getItem('daytrack_user_data');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
      setIsLoggedIn(true);
    }

    const savedTasks = localStorage.getItem('daytrack_tasks');
    if (savedTasks) {
      setGlobalTasks(JSON.parse(savedTasks));
    }
  }, []);

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setIsLoggedIn(true);
    localStorage.setItem('daytrack_user_data', JSON.stringify(data));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData({ name: '', email: '' });
    localStorage.removeItem('daytrack_user_data');
  };

  const handleAddTasksFromSchedule = (tasks: string[], scheduleName: string, day: string) => {
    const newTasks: Task[] = tasks.map(taskTitle => ({
      id: Date.now().toString() + Math.random(),
      title: taskTitle,
      priority: 'medium',
      completed: false,
      dueDate: day,
      source: 'schedule',
      scheduleName: scheduleName,
    }));

    const updatedTasks = [...globalTasks, ...newTasks];
    setGlobalTasks(updatedTasks);
    localStorage.setItem('daytrack_tasks', JSON.stringify(updatedTasks));
  };

  const handleUpdateTasks = (tasks: Task[]) => {
    setGlobalTasks(tasks);
    localStorage.setItem('daytrack_tasks', JSON.stringify(tasks));
  };

  const showBottomNav = isLoggedIn;

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
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
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}