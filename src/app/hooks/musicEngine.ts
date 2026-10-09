import type { Song } from './musicData';

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timer: number | null = null;
  private padNodes: OscillatorNode[] = [];
  private song: Song | null = null;

  private ensureContext(): boolean {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  play(song: Song) {
    this.stop();
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    this.song = song;
    const gain = this.masterGain.gain;
    gain.cancelScheduledValues(this.ctx.currentTime);
    gain.setValueAtTime(gain.value, this.ctx.currentTime);
    gain.linearRampToValueAtTime(0.24, this.ctx.currentTime + 1.2);

    this.startPad(song);
    this.timer = window.setInterval(() => this.tick(), song.tempo);
    this.tick();
  }

  private startPad(song: Song) {
    if (!this.ctx || !this.masterGain) return;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    filter.Q.value = 0.6;

    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.14;
    filter.connect(padGain).connect(this.masterGain);

    const base = song.root / 2;
    [1, 1.5, 2.004].forEach((mult, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = i === 2 ? 'triangle' : 'sine';
      osc.frequency.value = base * mult;
      osc.detune.value = (i - 1) * 5;
      osc.connect(filter);
      osc.start();
      this.padNodes.push(osc);
    });

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(padGain.gain);
    lfo.start();
    this.padNodes.push(lfo);
  }

  private note(freq: number, time: number, dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  private tick() {
    if (!this.ctx || !this.song) return;
    const time = this.ctx.currentTime + 0.02;
    const { scale, root, waveform, tempo } = this.song;
    const degree = scale[Math.floor(Math.random() * scale.length)];
    const octave = Math.random() < 0.3 ? 2 : 1;
    const freq = root * Math.pow(2, (degree + 12 * (octave - 1)) / 12);
    const dur = (tempo / 1000) * (1 + Math.random());
    this.note(freq, time, dur, waveform, 0.13);
    if (Math.random() < 0.4) {
      this.note(freq * 1.5, time, dur * 0.8, 'sine', 0.05);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx && this.masterGain) {
      const t = this.ctx.currentTime;
      const gain = this.masterGain.gain;
      gain.cancelScheduledValues(t);
      gain.setValueAtTime(gain.value, t);
      gain.linearRampToValueAtTime(0, t + 0.4);
    }
    const pads = this.padNodes;
    this.padNodes = [];
    this.song = null;
    window.setTimeout(() => {
      pads.forEach(node => {
        try { node.stop(); } catch { /* already stopped */ }
      });
    }, 500);
  }

  dispose() {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

export const musicEngine = new MusicEngine();
