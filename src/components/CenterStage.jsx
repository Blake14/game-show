import { actions } from '../game/reducer.js';
import Dice from './Dice.jsx';
import QuestionCard from './QuestionCard.jsx';

export default function CenterStage({ state, dispatch }) {
  const { phase, players, activePlayer, roll, round, maxRounds, currentQuestion } = state;
  const player = players[activePlayer];
  const showQuestion = phase === 'question' || phase === 'reveal';

  return (
    <div className="center-stage">
      <div className="center-inner">
        {showQuestion ? (
          <QuestionCard key={currentQuestion.id} state={state} dispatch={dispatch} />
        ) : (
          <div className="turn-panel" style={{ '--c': player.color }}>
            <div className="round-tag">
              {round === maxRounds ? '★ FINAL ROUND ★' : `ROUND ${round} OF ${maxRounds}`}
            </div>
            <h2 className="turn-name">{player.name}'s turn</h2>
            <Dice value={phase === 'awaitingRoll' ? null : roll} rolling={phase === 'rolling'} />
            {phase === 'awaitingRoll' ? (
              <>
                <button className="btn btn-roll" onClick={() => dispatch(actions.roll())}>
                  ROLL!
                </button>
                <div className="hint">or press Space</div>
              </>
            ) : (
              <div className="moving-label">{phase === 'rolling' ? 'Rolling…' : `Moving ${roll}…`}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
