import { GRID } from '../game/board.js';

// Nudges so up to 6 tokens sharing a space all stay visible.
const OFFSETS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [0, -1.6],
  [0, 1.6],
];

export default function Token({ player, index, count, active }) {
  const { row, col } = GRID[player.position];
  const [dx, dy] = count > 1 ? OFFSETS[index] : [0, 0];
  return (
    <div
      className={`token${active ? ' active' : ''}`}
      style={{
        left: `${((col - 0.5) * 100) / 7}%`,
        top: `${((row - 0.5) * 100) / 5}%`,
        '--dx': dx,
        '--dy': dy,
        '--c': player.color,
        '--fg': player.textColor,
      }}
    >
      {/* Re-keyed on every move so the hop animation replays each step. */}
      <div key={player.position} className="token-disc">
        {player.name[0].toUpperCase()}
      </div>
    </div>
  );
}
