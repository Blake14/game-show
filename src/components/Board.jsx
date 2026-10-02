import MarqueeLights from './MarqueeLights.jsx';
import Space from './Space.jsx';
import Token from './Token.jsx';
import CenterStage from './CenterStage.jsx';

export default function Board({ state, dispatch }) {
  const { spaces, players, phase, activePlayer, lastOutcome } = state;
  const active = players[activePlayer];
  const showTarget = phase === 'question' || phase === 'reveal';
  const stolen = phase === 'reveal' && lastOutcome?.type === 'steal' ? lastOutcome : null;

  return (
    <div className="stage">
      <div className="marquee board-frame">
        <MarqueeLights across={30} down={14} fast={phase === 'reveal'} />
        <div className="board">
          {spaces.map((s) => (
            <Space
              key={s.id}
              space={s}
              players={players}
              target={showTarget && active.position === s.id}
              stealFrom={stolen?.spaceId === s.id ? players[stolen.previousOwner] : null}
            />
          ))}
          <CenterStage state={state} dispatch={dispatch} />
          <div className="tokens">
            {players.map((p) => {
              const sharing = players.filter((o) => o.position === p.position);
              return (
                <Token
                  key={p.id}
                  player={p}
                  index={sharing.indexOf(p)}
                  count={sharing.length}
                  active={p.id === activePlayer}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
