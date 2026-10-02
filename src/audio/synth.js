// Built-in retro bleeps, used whenever a sound file is missing.
let ctx = null;
let master = null;

function audioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, at, dur, { type = 'square', vol = 0.12, to } = {}) {
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

const notes = (seq, opts) => seq.forEach(([f, at, dur]) => tone(f, at, dur, opts));

const RECIPES = {
  intro: () => {
    notes([[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.12], [1047, 0.3, 0.12], [784, 0.42, 0.1]]);
    notes([[1047, 0.55, 0.6], [784, 0.55, 0.6], [659, 0.55, 0.6]], { type: 'triangle', vol: 0.15 });
  },
  roll: () => {
    for (let i = 0; i < 9; i++) tone(300 + Math.random() * 600, i * 0.1, 0.05, { vol: 0.07 });
  },
  step: () => tone(1250, 0, 0.04, { vol: 0.07 }),
  question: () => tone(260, 0, 0.32, { type: 'triangle', vol: 0.2, to: 1300 }),
  correct: () => notes([[880, 0, 0.14], [1319, 0.12, 0.4]], { type: 'sine', vol: 0.28 }),
  wrong: () => {
    tone(140, 0, 0.55, { type: 'sawtooth', vol: 0.12 });
    tone(148, 0, 0.55, { type: 'sawtooth', vol: 0.12 });
  },
  claim: () => notes([[523, 0, 0.08], [659, 0.07, 0.08], [784, 0.14, 0.08], [1047, 0.21, 0.3]]),
  bonus: () => notes([[784, 0, 0.08], [1047, 0.08, 0.25]]),
  steal: () => {
    tone(1400, 0, 0.18, { type: 'sawtooth', vol: 0.08, to: 250 });
    tone(300, 0.2, 0.25, { type: 'square', vol: 0.1, to: 1500 });
  },
  rent: () => notes([[988, 0, 0.08], [1319, 0.08, 0.35]]),
  timer: () => tone(2000, 0, 0.025, { type: 'triangle', vol: 0.1 }),
  gameOver: () => {
    notes([[392, 0, 0.12], [523, 0.13, 0.12], [659, 0.26, 0.12], [784, 0.39, 0.3], [659, 0.72, 0.12], [784, 0.85, 0.8]]);
    notes([[523, 0.85, 0.8], [659, 0.85, 0.8]], { type: 'triangle', vol: 0.12 });
  },
};

export function synth(event, volume) {
  const recipe = RECIPES[event];
  if (!recipe || !audioContext()) return;
  master.gain.value = volume;
  recipe();
}
