import { actions } from '../game/reducer.js';

export default function Scoreboard({ state, dispatch }) {
  const { players, spaces, activePlayer, phase, lastOutcome } = state;
  const canSwitch = phase === 'awaitingRoll';

  return (
    <div className={`scoreboard${players.length > 4 ? ' compact' : ''}`}>
      {players.map((p) => {
        const squares = spaces.filter((s) => s.owner === p.id).length;
        const gain = phase === 'reveal' && lastOutcome?.beneficiary === p.id ? lastOutcome.points : 0;
        const isActive = p.id === activePlayer;
        return (
          <button
            key={p.id}
            className={`player-card${isActive ? ' active' : ''}${canSwitch && !isActive ? ' switchable' : ''}`}
            style={{ '--c': p.color, '--fg': p.textColor }}
            aria-pressed={isActive}
            title={canSwitch ? `Make it ${p.name}'s turn` : undefined}
            onClick={() => canSwitch && dispatch(actions.setActivePlayer(p.id))}
          >
            <span className="pc-token">{p.name[0].toUpperCase()}</span>
            <span className="pc-name">{p.name}</span>
            <span className="pc-points">{p.points.toLocaleString()}</span>
            <span className="pc-squares">
              {squares} square{squares === 1 ? '' : 's'}
            </span>
            {gain > 0 && <span className="pc-gain">+{gain}</span>}
          </button>
        );
      })}
    </div>
  );
}
