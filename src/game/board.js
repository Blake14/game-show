import { RULES } from '../config/rules.js';

// Space number -> CSS grid cell on the 7x5 board, clockwise from the top-left.
//  0  1  2  3  4  5  6
// 19                 7
// 18   CENTER STAGE  8
// 17                 9
// 16 15 14 13 12 11 10
function gridPos(i) {
  if (i <= 6) return { row: 1, col: i + 1 };
  if (i <= 9) return { row: i - 5, col: 7 };
  if (i <= 16) return { row: 5, col: 7 - (i - 10) };
  return { row: 4 - (i - 17), col: 1 };
}

export const GRID = Array.from({ length: RULES.boardSize }, (_, i) => gridPos(i));

export const nextSpace = (pos) => (pos + 1) % RULES.boardSize;

// Owned squares are spread evenly around the ring and dealt round-robin, so
// nobody starts with a clump. Space 0 (START) is always left neutral.
export function buildSpaces(numPlayers) {
  const size = RULES.boardSize;
  const spaces = Array.from({ length: size }, (_, id) => ({ id, owner: null }));
  const total = numPlayers * RULES.spacesPerPlayer;
  for (let k = 0; k < total; k++) {
    const pos = 1 + Math.floor((k * (size - 1)) / total);
    spaces[pos].owner = k % numPlayers;
  }
  return spaces;
}
