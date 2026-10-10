import { useCallback, useEffect, useState } from 'react';

export type AppTheme = 'light' | 'dark' | 'pastel' | 'auto';

const STORAGE_KEY = 'daytrack_theme';

export const themeLabels: Record<AppTheme, string> = {
  light: 'Sáng',
  dark: 'Tối',
  pastel: 'Pastel',
  auto: 'Tự động',
};

export function loadTheme(): AppTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'pastel' || raw === 'auto') return raw;
  } catch {
    // ignore storage failures
  }
  return 'light';
}

export function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  let resolved: AppTheme = theme;
  if (theme === 'auto') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', resolved);
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
}

export function useAppTheme() {
  const [theme, setTheme] = useState<AppTheme>(loadTheme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'auto') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const changeTheme = useCallback((next: AppTheme) => {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
  }, []);

  return { theme, changeTheme };
}