import { useMemo } from 'react';
import { PLAYER_COLORS, RULES } from '../config/rules.js';
import { actions, canUndo, finalStandings } from '../game/reducer.js';
import MarqueeLights from './MarqueeLights.jsx';

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        x: Math.random() * 100,
        delay: Math.random() * 4,
        dur: 2.8 + Math.random() * 2.5,
        spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
        color: PLAYER_COLORS[i % PLAYER_COLORS.length].hex,
        w: 8 + Math.random() * 8,
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.x}%`,
            width: p.w,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

export default function GameOver({ state, dispatch }) {
  const standings = finalStandings(state);
  const winners = standings.filter((p) => p.total === standings[0].total);
  const tie = winners.length > 1;

  return (
    <div className="screen gameover">
      <Confetti />
      <div className="marquee winner-frame">
        <MarqueeLights across={20} down={8} fast />
        <div className="winner-label">{tie ? "IT'S A TIE!" : 'THE WINNER IS'}</div>
        <div className="winner-names">
          {winners.map((w) => (
            <span key={w.id} className="winner-name" style={{ '--c': w.color }}>
              {w.name}
            </span>
          ))}
        </div>
      </div>

      <ol className="results">
        {standings.map((p, i) => (
          <li key={p.id} className="result-row" style={{ '--c': p.color, '--fg': p.textColor }}>
            <span className="result-rank">{i + 1}</span>
            <span className="pc-token">{p.name[0].toUpperCase()}</span>
            <span className="result-name">{p.name}</span>
            <span className="result-math">
              {p.points.toLocaleString()} pts + {p.squares} sq × {RULES.endBonusPerSpace}
            </span>
            <span className="result-total">{p.total.toLocaleString()}</span>
          </li>
        ))}
      </ol>

      <div className="menu-buttons">
        <button className="btn btn-go" onClick={() => dispatch(actions.startSetup())}>
          Play again
        </button>
        <button className="btn btn-secondary" onClick={() => dispatch(actions.quit())}>
          Main menu
        </button>
        {canUndo(state) && (
          <button className="btn btn-secondary" onClick={() => dispatch(actions.undo())}>
            Undo last answer
          </button>
        )}
      </div>
    </div>
  );
}
