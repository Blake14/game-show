import { useRef } from 'react';
import { GRID } from '../game/board.js';

export default function Space({ space, players, target, stealFrom }) {
  const { row, col } = GRID[space.id];
  const owner = space.owner === null ? null : players[space.owner];

  // Deal-in animation the first time; a flip every time ownership changes after.
  const firstOwner = useRef(space.owner);
  const changed = useRef(false);
  if (space.owner !== firstOwner.current) changed.current = true;

  const cls = [
    'space',
    owner ? 'owned' : 'neutral',
    changed.current ? 'flip' : 'deal',
    stealFrom ? 'steal-flash' : '',
  ].join(' ');

  return (
    <div className={`space-cell${target ? ' target' : ''}`} style={{ gridRow: row, gridColumn: col }}>
      <div
        key={space.owner ?? 'none'}
        className={cls}
        style={{
          '--c': owner?.color,
          '--old': stealFrom?.color,
          '--i': space.id,
        }}
      >
        <span className="space-num">{space.id + 1}</span>
        {owner && <span className="owner-mark">{owner.name[0].toUpperCase()}</span>}
        {space.id === 0 && <span className="start-label">START</span>}
      </div>
    </div>
  );
}
