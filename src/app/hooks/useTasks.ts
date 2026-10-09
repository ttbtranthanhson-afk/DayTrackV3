import { useState, useEffect, useRef } from 'react';

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
  source?: string;
  scheduleName?: string;
}

export const priorityConfig = {
  high:   { label: 'Ưu tiên cao',  bar: 'bg-rose-400',   badge: 'bg-rose-100 text-rose-600'   },
  medium: { label: 'Ưu tiên vừa',  bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-600'},
  low:    { label: 'Ưu tiên thấp', bar: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-600'   },
};

interface UseTasksProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export function useTasks({ tasks: propTasks, onUpdateTasks }: UseTasksProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'complete'>('all');
  const [tasks, setTasks] = useState<Task[]>(propTasks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
  const todayStr = `${dayNames[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}`;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i + 1);
    return {
      date: d.getDate(),
      dayShort: ['T2','T3','T4','T5','T6','T7','CN'][i],
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  useEffect(() => { setTasks(propTasks); }, [propTasks]);

  useEffect(() => {
    const handler = () => setShowAddModal(true);
    window.addEventListener('nav:quick-action', handler);
    return () => window.removeEventListener('nav:quick-action', handler);
  }, []);

  useEffect(() => {
    if (showAddModal) setTimeout(() => inputRef.current?.focus(), 100);
  }, [showAddModal]);

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    onUpdateTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      priority: newPriority,
      completed: false,
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    onUpdateTasks(updated);
    setNewTitle('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'active') return !t.completed;
    if (activeTab === 'complete') return t.completed;
    return true;
  });

  const groupedByPriority = (['high', 'medium', 'low'] as const).map(p => ({
    priority: p,
    tasks: filteredTasks.filter(t => t.priority === p),
  })).filter(g => g.tasks.length > 0);

  return {
    activeTab,
    setActiveTab,
    tasks,
    showAddModal,
    setShowAddModal,
    newTitle,
    setNewTitle,
    newPriority,
    setNewPriority,
    inputRef,
    todayStr,
    weekDays,
    filteredTasks,
    groupedByPriority,
    toggleTask,
    handleAddTask,
  };
}
