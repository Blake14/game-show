import { GAME_TITLE, GAME_TAGLINE, PLAYER_COLORS } from '../config/rules.js';
import MarqueeLights from './MarqueeLights.jsx';

export default function StartMenu({ onStart, onResume }) {
  return (
    <div className="screen start-menu">
      <div className="marquee title-frame">
        <MarqueeLights across={22} down={6} />
        <h1 className="logo">
          {[...GAME_TITLE].map((ch, i) => (
            <span
              key={i}
              style={{ '--c': PLAYER_COLORS[i % 4].hex, '--i': i }}
            >
              {ch}
            </span>
          ))}
        </h1>
        <p className="tagline">{GAME_TAGLINE}</p>
      </div>
      <div className="menu-buttons">
        <button className="btn btn-start" onClick={onStart}>
          PRESS START
        </button>
        {onResume && (
          <button className="btn btn-secondary" onClick={onResume}>
            Resume last game
          </button>
        )}
      </div>
    </div>
  );
}
