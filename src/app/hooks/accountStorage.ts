const ACCOUNT_POINTER_KEY = 'daytrack_current_account';

export const DEFAULT_ACCOUNT = 'guest';

export const ACCOUNT_DATA_KEYS = [
  'daytrack_user_data',
  'daytrack_tasks',
  'daytrack_weekday_schedules',
  'daytrack_calendar_schedules',
  'daytrack_calendar_ai_days',
  'daytrack_busy_hours',
  'daytrack_achievements',
  'daytrack_notification_settings',
  'daytrack_notification_log',
  'daytrack_custom_music',
];

function normalizeAccount(id: string): string {
  return id.trim().toLowerCase() || DEFAULT_ACCOUNT;
}

function readPointer(): string {
  try {
    return normalizeAccount(localStorage.getItem(ACCOUNT_POINTER_KEY) || DEFAULT_ACCOUNT);
  } catch {
    return DEFAULT_ACCOUNT;
  }
}

let currentAccount = readPointer();
const reloaders = new Set<() => void>();

export function getActiveAccount(): string {
  return currentAccount;
}

export function hasActiveAccount(): boolean {
  try {
    return localStorage.getItem(ACCOUNT_POINTER_KEY) !== null;
  } catch {
    return false;
  }
}

export function accountKey(base: string): string {
  return `${base}::${currentAccount}`;
}

export function getAccountItem(base: string): string | null {
  try {
    return localStorage.getItem(accountKey(base));
  } catch {
    return null;
  }
}

export function setAccountItem(base: string, value: string) {
  try {
    localStorage.setItem(accountKey(base), value);
  } catch {
    // ignore storage write failures
  }
}

export function removeAccountItem(base: string) {
  try {
    localStorage.removeItem(accountKey(base));
  } catch {
    // ignore storage write failures
  }
}

// Move data created before accounts existed into the first account that logs in,
// so existing users keep their schedules/tasks/achievements.
function claimLegacyData(account: string) {
  try {
    for (const base of ACCOUNT_DATA_KEYS) {
      const legacy = localStorage.getItem(base);
      if (legacy === null) continue;
      const scopedKey = `${base}::${account}`;
      if (localStorage.getItem(scopedKey) === null) {
        localStorage.setItem(scopedKey, legacy);
      }
      localStorage.removeItem(base);
    }
  } catch {
    // ignore storage failures
  }
}

function notifyReloaders() {
  reloaders.forEach(fn => fn());
}

export function activateAccount(id: string) {
  currentAccount = normalizeAccount(id);
  try {
    localStorage.setItem(ACCOUNT_POINTER_KEY, currentAccount);
  } catch {
    // ignore storage failures
  }
  claimLegacyData(currentAccount);
  notifyReloaders();
}

export function clearActiveAccount() {
  currentAccount = DEFAULT_ACCOUNT;
  try {
    localStorage.removeItem(ACCOUNT_POINTER_KEY);
  } catch {
    // ignore storage failures
  }
  notifyReloaders();
}

export function onAccountChange(fn: () => void): () => void {
  reloaders.add(fn);
  return () => {
    reloaders.delete(fn);
  };
}

// Re-read every module store from storage (used after bulk data changes,
// e.g. seeding/restoring tutorial sample data).
export function refreshStores(): void {
  notifyReloaders();
}
