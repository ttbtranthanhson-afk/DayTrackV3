import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { loadSettings, type NotificationSettings } from './notificationSettings';
import { notify, parseClock, requestPermission } from './notificationService';
import { dayNameFromDate } from './scheduleData';
import { launchFocus } from './focusLauncher';
import { getAccountItem, setAccountItem } from './accountStorage';
import { isBlockFocusActive, isBlockFocusCompleted } from './focusBlockTracker';

const LOG_KEY = 'daytrack_notification_log';
const TICK_MS = 20000;
const FIVE_MIN_MS = 5 * 60 * 1000;
const WINDOW_MS = 20 * 60 * 1000;

interface ParsedBlock {
  id: string;
  title: string;
  start: number;
  end: number;
}

function todayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function weekdayIndex(date: Date): number {
  return date.getDay() === 0 ? 6 : date.getDay() - 1;
}

function tsAt(minutesOfDay: number, now: Date): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutesOfDay);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d.getTime();
}

function readBlocks(): ParsedBlock[] {
  try {
    const raw = getAccountItem('daytrack_weekday_schedules');
    const map = raw ? (JSON.parse(raw) as Record<string, Array<{ id?: string; title?: string; time?: string }>>) : {};
    const day = dayNameFromDate(new Date());

    const rawCalendar = getAccountItem('daytrack_calendar_schedules');
    const calendar = rawCalendar
      ? (JSON.parse(rawCalendar) as Record<string, Array<{ id?: string; title?: string; time?: string }>>)
      : {};
    const now = new Date();
    const calendarDay = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    const toBlocks = (list: Array<{ id?: string; title?: string; time?: string }>): ParsedBlock[] =>
      (list || [])
        .map(block => {
          if (!block.time) return null;
          const m = block.time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
          if (!m) return null;
          const start = Number(m[1]) * 60 + Number(m[2]);
          const end = Number(m[3]) * 60 + Number(m[4]);
          return { id: block.id || block.title || String(start), title: block.title || '', start, end };
        })
        .filter((b): b is ParsedBlock => b !== null);

    return [...toBlocks(map[day]), ...toBlocks(calendar[calendarDay])];
  } catch {
    return [];
  }
}

interface StoredTask {
  id: string;
  completed?: boolean;
  completedDate?: string;
  recurrence?: 'daily';
  source?: string;
  scheduleName?: string;
  scheduleTaskId?: string;
  weekday?: number;
  dateKey?: string;
}

function readTasks(): StoredTask[] {
  try {
    const raw = getAccountItem('daytrack_tasks');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isDueToday(task: StoredTask, key: string, weekday: number): boolean {
  if (task.recurrence === 'daily') return true;
  if (task.dateKey) return task.dateKey === key;
  if (task.weekday !== undefined) return task.weekday === weekday;
  return true;
}

function isCompletedToday(task: StoredTask, key: string): boolean {
  if (task.recurrence === 'daily') return task.completedDate === key;
  return !!task.completed;
}

function readLog(): string[] {
  try {
    const raw = getAccountItem(LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLog(log: string[]) {
  setAccountItem(LOG_KEY, JSON.stringify(log));
}

export function useNotificationScheduler() {
  const navigate = useNavigate();

  useEffect(() => {
    requestPermission();

    const tick = () => {
      const settings: NotificationSettings = loadSettings();
      const now = new Date();
      const key = todayKey(now);
      const weekday = weekdayIndex(now);
      const log = readLog().filter(k => k.startsWith(key + ':'));
      const fired = (k: string) => log.includes(k);
      const mark = (k: string) => {
        log.push(k);
        writeLog(log);
      };

      const blocks = readBlocks();
      const tasks = readTasks();
      const incompleteInSchedule = (title: string) =>
        tasks.some(
          t =>
            t.source === 'schedule' &&
            t.scheduleName === title &&
            isDueToday(t, key, weekday) &&
            !isCompletedToday(t, key)
        );
      const incompleteToday = tasks.filter(t => isDueToday(t, key, weekday) && !isCompletedToday(t, key)).length;
      const nowMs = now.getTime();

      if (settings.reminders.schedule) {
        blocks.forEach(block => {
          if (isBlockFocusActive(block.id) || isBlockFocusCompleted(block.id)) return;
          const startTs = tsAt(block.start, now);
          const endTs = tsAt(block.end, now);
          const diffStart = (startTs - nowMs) / 1000;
          const diffEnd = (endTs - nowMs) / 1000;

          if (diffStart > 0 && diffStart <= 300) {
            const k = `${key}:sch5:${block.id}`;
            if (!fired(k)) {
              mark(k);
              notify('Nhắc lịch trình', `Lịch trình ${block.title} sẽ diễn ra sau 5 phút nữa`, settings);
            }
          }

          if (nowMs >= startTs && nowMs < endTs) {
            const k = `${key}:started:${block.id}`;
            if (!fired(k)) {
              mark(k);
              const seconds = Math.max((block.end - block.start) * 60, 25 * 60);
              notify('Lịch trình đã bắt đầu', `Lịch trình ${block.title} đã bắt đầu`, settings, () => {
                navigate('/focus');
                launchFocus(seconds);
              });
            }
          }

          if (settings.reminders.deadline) {
            if (diffEnd > 0 && diffEnd <= 300) {
              const k = `${key}:dld:${block.id}`;
              if (!fired(k) && incompleteInSchedule(block.title)) {
                mark(k);
                notify('Nhắc hạn nhiệm vụ', `Còn nhiệm vụ chưa hoàn thành trong lịch trình ${block.title}`, settings);
              }
            }
          }
        });

        const morning = parseClock(settings.times.morning);
        if (morning) {
          const morningTs = tsAt(morning.h * 60 + morning.m, now);
          if (nowMs >= morningTs && nowMs - morningTs < WINDOW_MS) {
            const k = `${key}:morn`;
            if (!fired(k)) {
              mark(k);
              const names = blocks.map(b => b.title);
              const body = names.length
                ? `Hôm nay bạn có ${names.length} lịch trình: ${names.join(', ')}`
                : 'Hôm nay bạn không có lịch trình nào.';
              notify('Lịch trình hôm nay', body, settings);
            }
          }
        }
      }

      if (settings.reminders.summary) {
        const evening = parseClock(settings.times.evening);
        if (evening) {
          const eveningTs = tsAt(evening.h * 60 + evening.m, now);
          if (nowMs >= eveningTs && nowMs - eveningTs < WINDOW_MS) {
            const k = `${key}:sum`;
            if (!fired(k)) {
              mark(k);
              const allEnded = blocks.length === 0 || blocks.every(b => nowMs >= tsAt(b.end, now));
              if (incompleteToday === 0 && allEnded) {
                notify('Tổng kết ngày', 'Đã hoàn thành ngày 😊', settings);
              } else {
                notify('Tổng kết ngày', 'Còn nhiệm vụ chưa hoàn thành', settings);
              }
            }
          }
        }
      }
    };

    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [navigate]);
}