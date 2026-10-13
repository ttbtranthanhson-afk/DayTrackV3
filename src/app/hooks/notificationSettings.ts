import { getAccountItem, setAccountItem } from './accountStorage';

export interface NotificationSettings {
  reminders: {
    schedule: boolean;
    deadline: boolean;
    summary: boolean;
  };
  sound: {
    sound: boolean;
    vibrate: boolean;
    silent: boolean;
  };
  times: {
    morning: string;
    evening: string;
  };
}

export const STORAGE_KEY = 'daytrack_notification_settings';

export const defaultSettings: NotificationSettings = {
  reminders: { schedule: true, deadline: true, summary: true },
  sound: { sound: true, vibrate: false, silent: false },
  times: { morning: '08:00', evening: '21:00' },
};

export function loadSettings(): NotificationSettings {
  try {
    const raw = getAccountItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        reminders: { ...defaultSettings.reminders, ...parsed.reminders },
        sound: { ...defaultSettings.sound, ...parsed.sound },
        times: { ...defaultSettings.times, ...parsed.times },
      };
    }
  } catch {
    // ignore malformed storage
  }
  return { ...defaultSettings };
}

export function saveSettings(settings: NotificationSettings) {
  setAccountItem(STORAGE_KEY, JSON.stringify(settings));
}