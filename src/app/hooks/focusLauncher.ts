const PENDING_KEY = 'daytrack_pending_focus_seconds';
const EVENT = 'focus:auto-start';

export function launchFocus(seconds: number) {
  const secs = Math.max(1, Math.round(seconds));
  try {
    sessionStorage.setItem(PENDING_KEY, String(secs));
  } catch {
    // session storage may be unavailable
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { seconds: secs } }));
}

export function consumePendingFocus(): number | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (raw === null) return null;
    sessionStorage.removeItem(PENDING_KEY);
    const secs = Number(raw);
    return Number.isFinite(secs) && secs > 0 ? secs : null;
  } catch {
    return null;
  }
}