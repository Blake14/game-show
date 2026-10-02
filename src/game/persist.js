// Saves the game after every settled moment so an accidental refresh
// mid-family-night doesn't wipe it out. Only "resting" phases are saved.
const KEY = 'gameshow.savedGame';
export const SAVEABLE_PHASES = ['awaitingRoll', 'question', 'reveal'];

export function saveGame(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, history: state.history.slice(-10) }));
  } catch {
    // storage full or blocked; the game still works, it just can't resume
  }
}

export function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved && SAVEABLE_PHASES.includes(saved.phase) ? saved : null;
  } catch {
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
