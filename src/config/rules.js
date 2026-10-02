export const GAME_TITLE = 'QUIZ-O-RAMA';
export const GAME_TAGLINE = 'The Trivia Board Game Spectacular!';

export const RULES = {
  boardSize: 20, // the 7x5 ring in board.js is built for exactly 20 spaces
  spacesPerPlayer: 3,
  points: { claim: 100, bonus: 50, steal: 100, rent: 100 },
  endBonusPerSpace: 50,
  defaultRounds: 8,
  minRounds: 1,
  maxRounds: 20,
  minPlayers: 2,
  maxPlayers: 6,
  defaultTimerSeconds: 20,
  timerChoices: [10, 15, 20, 30],
  timing: {
    rollMs: 1000, // die tumbles this long
    stepMs: 250, // per space moved
    landMs: 400, // pause on the landing space before the card opens
    revealMs: 2500, // how long the answer shows before the next turn
  },
};

// `text` is the letter color that reads best on top of the player color.
export const PLAYER_COLORS = [
  { key: 'red', name: 'Red', hex: '#E63946', text: '#ffffff' },
  { key: 'blue', name: 'Blue', hex: '#2F80ED', text: '#ffffff' },
  { key: 'yellow', name: 'Yellow', hex: '#F2C94C', text: '#1f0e05' },
  { key: 'green', name: 'Green', hex: '#27AE60', text: '#ffffff' },
  { key: 'purple', name: 'Purple', hex: '#9B51E0', text: '#ffffff' },
  { key: 'teal', name: 'Teal', hex: '#2EC4B6', text: '#1f0e05' },
];
