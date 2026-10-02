import { useState } from 'react';
import { PLAYER_COLORS, RULES } from '../config/rules.js';

const KEY = 'gameshow.setup';

function defaultSetup() {
  return {
    count: 4,
    players: PLAYER_COLORS.map((c) => ({ name: '', colorKey: c.key })),
    rounds: RULES.defaultRounds,
    timer: false,
    timerSeconds: RULES.defaultTimerSeconds,
  };
}

function loadSetup() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved?.players?.length === PLAYER_COLORS.length ? { ...defaultSetup(), ...saved } : defaultSetup();
  } catch {
    return defaultSetup();
  }
}

const colorOf = (key) => PLAYER_COLORS.find((c) => c.key === key);

export default function PlayerSetup({ onStart, onBack }) {
  const [setup, setSetup] = useState(loadSetup);
  const active = setup.players.slice(0, setup.count);
  const update = (patch) => setSetup((s) => ({ ...s, ...patch }));
  const updatePlayer = (i, patch) =>
    setSetup((s) => ({ ...s, players: s.players.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));

  // Clicking a swatch moves to the next color no other active player is using.
  const cycleColor = (i) => {
    const taken = new Set(active.filter((_, j) => j !== i).map((p) => p.colorKey));
    const start = PLAYER_COLORS.findIndex((c) => c.key === setup.players[i].colorKey);
    for (let step = 1; step <= PLAYER_COLORS.length; step++) {
      const c = PLAYER_COLORS[(start + step) % PLAYER_COLORS.length];
      if (!taken.has(c.key)) return updatePlayer(i, { colorKey: c.key });
    }
  };

  const colorClash = new Set(active.map((p) => p.colorKey)).size !== active.length;

  const start = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(setup));
    } catch {
      // ignore
    }
    onStart({
      players: active,
      rounds: setup.rounds,
      timer: setup.timer,
      timerSeconds: setup.timerSeconds,
    });
  };

  return (
    <div className="screen">
      <form
        className="setup"
        onSubmit={(e) => {
          e.preventDefault();
          if (!colorClash) start();
        }}
      >
        <h2>Who's Playing?</h2>

        <div className="setup-row">
          <span className="setup-label">Players</span>
          <div className="seg">
            {Array.from({ length: RULES.maxPlayers - RULES.minPlayers + 1 }, (_, i) => i + RULES.minPlayers).map(
              (n) => (
                <button
                  type="button"
                  key={n}
                  className={n === setup.count ? 'on' : ''}
                  onClick={() => update({ count: n })}
                >
                  {n}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="player-rows">
          {active.map((p, i) => {
            const color = colorOf(p.colorKey);
            return (
              <div className="player-row" key={i}>
                <button
                  type="button"
                  className="swatch"
                  style={{ '--c': color.hex, '--fg': color.text }}
                  onClick={() => cycleColor(i)}
                  title="Change color"
                >
                  {(p.name.trim() || color.name)[0].toUpperCase()}
                </button>
                <input
                  className="name-input"
                  value={p.name}
                  maxLength={14}
                  placeholder={`${color.name} player`}
                  onChange={(e) => updatePlayer(i, { name: e.target.value })}
                />
              </div>
            );
          })}
        </div>

        <div className="setup-row">
          <span className="setup-label">Rounds</span>
          <div className="stepper">
            <button
              type="button"
              onClick={() => update({ rounds: Math.max(RULES.minRounds, setup.rounds - 1) })}
            >
              −
            </button>
            <span className="stepper-value">{setup.rounds}</span>
            <button
              type="button"
              onClick={() => update({ rounds: Math.min(RULES.maxRounds, setup.rounds + 1) })}
            >
              +
            </button>
          </div>
          <span className="setup-note">about {Math.round(setup.rounds * setup.count * 1.1)} min</span>
        </div>

        <div className="setup-row">
          <span className="setup-label">Timer</span>
          <div className="seg">
            <button type="button" className={!setup.timer ? 'on' : ''} onClick={() => update({ timer: false })}>
              Off
            </button>
            {RULES.timerChoices.map((s) => (
              <button
                type="button"
                key={s}
                className={setup.timer && setup.timerSeconds === s ? 'on' : ''}
                onClick={() => update({ timer: true, timerSeconds: s })}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        {colorClash && <p className="setup-error">Two players have the same color. Click a circle to change it.</p>}

        <div className="setup-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn btn-go" disabled={colorClash}>
            START GAME
          </button>
        </div>
      </form>
    </div>
  );
}
