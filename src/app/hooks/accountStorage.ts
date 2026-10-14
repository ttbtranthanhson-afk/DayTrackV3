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
  'daytrack_achievement_stats',
  'daytrack_notification_settings',
  'daytrack_notification_log',
  'daytrack_focus_blocks',
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

// ── account registry (email + password) ──

const ACCOUNTS_KEY = 'daytrack_accounts';

interface AccountRecord {
  email: string;
  name: string;
  password: string;
  createdAt: number;
}

function hashPassword(password: string): string {
  const salted = `daytrack::${password}::v1`;
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < salted.length; i += 1) {
    const code = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 + code, 0x85ebca6b) ^ (h2 >>> 13);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

function readAccounts(): Record<string, AccountRecord> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, AccountRecord>) : {};
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, AccountRecord>) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore storage failures
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export interface PasswordChecks {
  length: boolean;
  upper: boolean;
  number: boolean;
  special: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordStrong(password: string): boolean {
  const checks = getPasswordChecks(password);
  return checks.length && checks.upper && checks.number && checks.special;
}

export function accountExists(email: string): boolean {
  return normalizeAccount(email) in readAccounts();
}

export function registerAccount(email: string, name: string, password: string): boolean {
  const id = normalizeAccount(email);
  const accounts = readAccounts();
  if (accounts[id]) return false;
  accounts[id] = { email: id, name: name.trim(), password: hashPassword(password), createdAt: Date.now() };
  writeAccounts(accounts);
  return true;
}

export type LoginResult = 'ok' | 'not_found' | 'bad_password';

export function verifyAccount(email: string, password: string): LoginResult {
  const account = readAccounts()[normalizeAccount(email)];
  if (!account) return 'not_found';
  return account.password === hashPassword(password) ? 'ok' : 'bad_password';
}

export function getAccountName(email: string): string | undefined {
  return readAccounts()[normalizeAccount(email)]?.name;
}
