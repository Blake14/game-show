// Maps each game event to a sound file in /public/sounds.
// - Set an entry to null to silence it.
// - Use an array to pick a random file each time (handy for announcer lines).
// - Missing files are fine: the game falls back to a built-in retro synth
//   sound (turn that off with USE_SYNTH_FALLBACK = false).
export const SOUNDS = {
  intro: '/sounds/intro.mp3',
  roll: '/sounds/roll.mp3',
  step: '/sounds/tick.mp3',
  question: '/sounds/whoosh.mp3',
  correct: '/sounds/ding.mp3',
  wrong: '/sounds/buzzer.mp3',
  claim: '/sounds/claim.mp3',
  bonus: '/sounds/bonus.mp3',
  steal: '/sounds/steal.mp3',
  rent: '/sounds/cash.mp3',
  timer: '/sounds/clock-loop.mp3', // loops while the question timer runs
  gameOver: '/sounds/fanfare.mp3',
};

export const USE_SYNTH_FALLBACK = true;
