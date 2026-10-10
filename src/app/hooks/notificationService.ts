import { toast } from 'sonner';
import type { NotificationSettings } from './notificationSettings';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function requestPermission() {
  if (!isNotificationSupported()) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

let ctx: AudioContext | null = null;

export function playChime() {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    const notes = [880, 1174.66, 1567.98];
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx!.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain);
      gain.connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {
    // audio may be unavailable
  }
}

export function vibrate(pattern: number[] | number = [200, 100, 200]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // vibration may be unavailable
  }
}

export function notify(
  title: string,
  body: string,
  settings: NotificationSettings,
  onClick?: () => void
) {
  if (!settings.sound.silent) {
    if (settings.sound.sound) playChime();
    if (settings.sound.vibrate) vibrate();
  }

  toast(title, { description: body, duration: 7000 });

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, { body });
      if (onClick) {
        n.onclick = () => {
          window.focus();
          onClick();
          n.close();
        };
      }
    } catch {
      // native notification failed
    }
  }
}

export function parseClock(time: string): { h: number; m: number } | null {
  const m = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { h, m: min };
}

export function formatClock(time: string): string {
  const parsed = parseClock(time);
  if (!parsed) return time;
  const period = parsed.h >= 12 ? 'CH' : 'SA';
  const hour = parsed.h % 12 || 12;
  return `${hour}:${String(parsed.m).padStart(2, '0')} ${period}`;
}