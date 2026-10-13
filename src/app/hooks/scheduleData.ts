import type { BlockAnalysis } from '../../../shared/ai';

export const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
export const dayShorts = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export type TaskPriority = 'high' | 'medium' | 'low';

export interface ScheduleTask {
  id: string;
  title: string;
  priority: TaskPriority;
}

export const taskPriorities: TaskPriority[] = ['high', 'medium', 'low'];

export function normalizeTasks(tasks?: (ScheduleTask | string)[]): ScheduleTask[] {
  return (tasks || []).map((task, index) =>
    typeof task === 'string'
      ? { id: `st-${index}-${task}`, title: task, priority: 'medium' }
      : { id: task.id ?? `st-${index}-${task.title}`, title: task.title, priority: task.priority ?? 'medium' }
  );
}

export interface ScheduleBlock {
  id: string;
  title: string;
  time: string;
  color: string;
  tasks?: ScheduleTask[];
  analysis?: BlockAnalysis;
}

export interface ScheduleFormData {
  id?: string;
  name: string;
  tasks: ScheduleTask[];
  timeStart: string;
  timeEnd: string;
  color: string;
}

export const blockColors = [
  'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-orange-400', 'bg-pink-400', 'bg-yellow-400',
];

export const colorOptions: { value: string; swatch: string; ring: string }[] = [
  { value: 'bg-blue-400',   swatch: 'bg-blue-100',   ring: 'border-blue-500' },
  { value: 'bg-purple-400', swatch: 'bg-purple-100', ring: 'border-purple-500' },
  { value: 'bg-green-400',  swatch: 'bg-green-100',  ring: 'border-green-500' },
  { value: 'bg-orange-400', swatch: 'bg-orange-100', ring: 'border-orange-500' },
  { value: 'bg-pink-400',   swatch: 'bg-pink-100',   ring: 'border-pink-500' },
  { value: 'bg-yellow-400', swatch: 'bg-yellow-100', ring: 'border-yellow-500' },
];

export const initialSchedule: Record<string, ScheduleBlock[]> = {
  'Thứ Hai': [
    { id: '1', title: 'Toán học', time: '9:00 - 10:30', color: 'bg-blue-400' },
    { id: '2', title: 'Vật lý', time: '11:00 - 12:30', color: 'bg-purple-400' },
    { id: '3', title: 'Tự học', time: '14:00 - 16:00', color: 'bg-green-400' },
  ],
  'Thứ Ba': [
    { id: '4', title: 'Hóa học', time: '9:00 - 10:30', color: 'bg-orange-400' },
    { id: '5', title: 'Tiếng Anh', time: '11:00 - 12:30', color: 'bg-pink-400' },
  ],
};

export const colorMap: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  'bg-blue-400':   { bg: 'bg-blue-50',   text: 'text-blue-900',   badge: 'bg-blue-400',   border: 'border-blue-100' },
  'bg-purple-400': { bg: 'bg-purple-50', text: 'text-purple-900', badge: 'bg-purple-400', border: 'border-purple-100' },
  'bg-green-400':  { bg: 'bg-green-50',  text: 'text-green-900',  badge: 'bg-green-400',  border: 'border-green-100' },
  'bg-orange-400': { bg: 'bg-orange-50', text: 'text-orange-900', badge: 'bg-orange-400', border: 'border-orange-100' },
  'bg-pink-400':   { bg: 'bg-pink-50',   text: 'text-pink-900',   badge: 'bg-pink-400',   border: 'border-pink-100' },
  'bg-yellow-400': { bg: 'bg-yellow-50', text: 'text-yellow-900', badge: 'bg-yellow-400', border: 'border-yellow-100' },
};

export function dayNameFromDate(date: Date): string {
  const weekday = date.getDay();
  return days[weekday === 0 ? 6 : weekday - 1];
}
