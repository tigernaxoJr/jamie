import { useLocalStorage } from '@vueuse/core';

/** 遊戲音效開關（所有遊戲共用） */
export const muted = useLocalStorage('games-muted', false);

let ctx: AudioContext | null = null;

const audio = (): AudioContext | null => {
  if (muted.value || typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

const tone = (
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  delay = 0,
  gain = 0.12,
) => {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
};

const noise = (duration: number, gain = 0.3) => {
  const ac = audio();
  if (!ac) return;
  const buffer = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ac.createBufferSource();
  const g = ac.createGain();
  g.gain.value = gain;
  src.buffer = buffer;
  src.connect(g).connect(ac.destination);
  src.start();
};

/** 簡單的合成音效，不需要載入任何音檔 */
export const sfx = {
  click: () => tone(520, 0.05, 'triangle'),
  correct: () => {
    tone(660, 0.1);
    tone(990, 0.15, 'sine', 0.08);
  },
  wrong: () => tone(180, 0.3, 'square', 0, 0.08),
  hit: () => tone(300, 0.12, 'sawtooth', 0, 0.1),
  explode: () => noise(0.5),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', i * 0.12)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'triangle', i * 0.18)),
};
