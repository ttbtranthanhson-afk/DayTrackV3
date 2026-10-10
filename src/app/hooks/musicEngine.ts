import type { Song } from './musicData';

const FILE_VOLUME = 0.5;
const FADE_STEP_MS = 50;

export class MusicEngine {
  private audio: HTMLAudioElement | null = null;
  private fadeTimer: number | null = null;
  private stopToken = 0;

  private fadeTo(el: HTMLAudioElement, target: number, duration: number) {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    const from = el.volume;
    const steps = Math.max(1, Math.round((duration * 1000) / FADE_STEP_MS));
    const delta = (target - from) / steps;
    let step = 0;
    this.fadeTimer = window.setInterval(() => {
      step += 1;
      el.volume = Math.max(0, Math.min(1, from + delta * step));
      if (step >= steps && this.fadeTimer) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, FADE_STEP_MS);
  }

  play(song: Song) {
    this.stop();
    const el = new Audio();
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0;
    el.src = song.src;
    void el.play().catch(() => { /* user gesture may be required; ignored */ });
    this.audio = el;
    this.fadeTo(el, FILE_VOLUME, 1.2);
  }

  stop() {
    const el = this.audio;
    if (!el) return;
    this.audio = null;
    const token = ++this.stopToken;
    this.fadeTo(el, 0, 0.4);
    window.setTimeout(() => {
      if (token !== this.stopToken) return;
      el.pause();
      el.src = '';
      el.load();
    }, 450);
  }

  dispose() {
    this.stop();
  }
}

export const musicEngine = new MusicEngine();