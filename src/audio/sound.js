import { SOUNDS, USE_SYNTH_FALLBACK } from '../config/sounds.js';
import { synth } from './synth.js';

const PREFS_KEY = 'gameshow.sound';
let { volume, muted } = loadPrefs();
const clips = new Map(); // src -> { audio, broken }
const loops = new Map(); // event -> { audio } | { interval }

function loadPrefs() {
  const defaults = { volume: 0.7, muted: false };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(PREFS_KEY)) };
  } catch {
    return defaults;
  }
}

function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ volume, muted }));
  } catch {
    // ignore
  }
}

function clip(src) {
  let c = clips.get(src);
  if (!c) {
    const audio = new Audio();
    c = { audio, broken: false };
    audio.preload = 'auto';
    audio.addEventListener('error', () => (c.broken = true));
    audio.src = src;
    clips.set(src, c);
  }
  return c;
}

function sourceFor(event) {
  const entry = SOUNDS[event];
  const src = Array.isArray(entry) ? entry[Math.floor(Math.random() * entry.length)] : entry;
  return src || null;
}

function fallback(event) {
  if (USE_SYNTH_FALLBACK && !muted) synth(event, volume);
}

export function preloadSounds() {
  Object.values(SOUNDS).flat().filter(Boolean).forEach(clip);
}

// Never throws: a missing or unplayable file falls back to the synth.
export function play(event) {
  if (muted) return;
  const src = sourceFor(event);
  if (!src || clip(src).broken) return fallback(event);
  const audio = clip(src).audio.cloneNode();
  audio.volume = volume;
  audio.play().catch(() => fallback(event));
}

export function startLoop(event) {
  if (loops.has(event)) return;
  const tickLoop = () => {
    fallback(event);
    return { interval: setInterval(() => fallback(event), 1000) };
  };
  const src = sourceFor(event);
  if (!src || clip(src).broken) {
    loops.set(event, tickLoop());
    return;
  }
  const audio = clip(src).audio.cloneNode();
  audio.loop = true;
  audio.volume = muted ? 0 : volume;
  const entry = { audio };
  loops.set(event, entry);
  audio.play().catch(() => {
    if (loops.get(event) === entry) loops.set(event, tickLoop());
  });
}

export function stopLoop(event) {
  const loop = loops.get(event);
  if (!loop) return;
  loop.audio?.pause();
  clearInterval(loop.interval);
  loops.delete(event);
}

export const getVolume = () => volume;
export const isMuted = () => muted;

export function setVolume(v) {
  volume = v;
  loops.forEach((l) => l.audio && (l.audio.volume = muted ? 0 : volume));
  savePrefs();
}

export function setMuted(m) {
  muted = m;
  loops.forEach((l) => l.audio && (l.audio.volume = muted ? 0 : volume));
  savePrefs();
}
