import type { Song } from './musicData';

const FILE_VOLUME = 0.5;
const FADE_STEP_MS = 50;

export class MusicEngine {
  private audio: HTMLAudioElement | null = null;
  private fadeTimer: number | null = null;
  private stopToken = 0;
  private currentSongId: string | null = null;
  private onTimeUpdate: (() => void) | null = null;

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
    el.src = `${import.meta.env.BASE_URL}${song.src.replace(/^\//, '')}`;
    el.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) this.onTimeUpdate();
    }, { passive: true });
    void el.play().catch(() => { /* user gesture may be required; ignored */ });
    this.audio = el;
    this.currentSongId = song.id;
    this.fadeTo(el, FILE_VOLUME, 1.2);
  }

  stop() {
    const el = this.audio;
    if (!el) return;
    this.audio = null;
    this.currentSongId = null;
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
    this.onTimeUpdate = null;
  }
  setOnTimeUpdate(cb: (() => void) | null) {
    this.onTimeUpdate = cb;
  }

  getCurrentTime() {
    return this.audio ? this.audio.currentTime : 0;
  }

  getDuration() {
    return this.audio ? (this.audio.duration || 0) : 0;
  }

  isPlayingId(id: string | null | undefined) {
    return !!(this.audio && id && this.currentSongId === id);
  }

  togglePlay(song: Song) {
    if (this.currentSongId === song.id && this.audio) {
      if (this.audio.paused) {
        void this.audio.play().catch(() => {});
      } else {
        this.audio.pause();
      }
      if (this.onTimeUpdate) this.onTimeUpdate();
      return;
    }
    this.play(song);
  }

  replay() {
    if (this.audio) {
      this.audio.currentTime = 0;
      if (this.audio.paused) {
        void this.audio.play().catch(() => {});
      }
      if (this.onTimeUpdate) this.onTimeUpdate();
    }
  }
}

export const musicEngine = new MusicEngine();