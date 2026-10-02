import { useEffect, useReducer, useRef, useState } from 'react';
import { RULES } from './config/rules.js';
import { actions, canUndo, initialState, reducer } from './game/reducer.js';
import { clearGame, loadGame, saveGame, SAVEABLE_PHASES } from './game/persist.js';
import { play, preloadSounds, startLoop, stopLoop } from './audio/sound.js';
import StartMenu from './components/StartMenu.jsx';
import PlayerSetup from './components/PlayerSetup.jsx';
import Board from './components/Board.jsx';
import Scoreboard from './components/Scoreboard.jsx';
import SoundControls from './components/SoundControls.jsx';
import GameOver from './components/GameOver.jsx';

const T = RULES.timing;

// All timers live here; the reducer only holds logic.
function useAutoAdvance(state, dispatch) {
  const { phase, stepsLeft, settings, imageZoom } = state;
  const questionId = state.currentQuestion?.id;
  useEffect(() => {
    let t;
    if (phase === 'rolling') t = setTimeout(() => dispatch(actions.step()), T.rollMs);
    else if (phase === 'moving')
      t = stepsLeft > 0
        ? setTimeout(() => dispatch(actions.step()), T.stepMs)
        : setTimeout(() => dispatch(actions.land()), T.landMs);
    else if (phase === 'reveal' && !imageZoom) t = setTimeout(() => dispatch(actions.nextTurn()), T.revealMs);
    else if (phase === 'question' && settings.timer)
      t = setTimeout(() => dispatch(actions.answer(-1)), settings.timerSeconds * 1000);
    return () => clearTimeout(t);
  }, [phase, stepsLeft, questionId, imageZoom, settings.timer, settings.timerSeconds, dispatch]);
}

function useGameSounds(state) {
  const prev = useRef(state);
  useEffect(() => {
    const p = prev.current;
    prev.current = state;
    const { phase } = state;

    if (phase !== p.phase) {
      if (phase === 'rolling') play('roll');
      if (phase === 'gameOver') play('gameOver');
      if (phase === 'reveal') {
        const o = state.lastOutcome;
        play(o.correct ? 'correct' : 'wrong');
        if (o.type !== 'miss') setTimeout(() => play(o.type), 450);
      }
    }
    if (phase === 'question' && (p.phase !== 'question' || p.currentQuestion?.id !== state.currentQuestion?.id))
      play('question');
    if (phase === 'moving' && state.stepsLeft !== p.stepsLeft) play('step');

    if (phase === 'question' && state.settings.timer) startLoop('timer');
    else stopLoop('timer');
  }, [state]);

  useEffect(() => () => stopLoop('timer'), []);
}

function useHotkeys(state, dispatch) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      const key = e.key.toLowerCase();
      if (key === 'escape' && state.imageZoom) {
        dispatch(actions.setZoom(false));
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        if (canUndo(state)) {
          e.preventDefault();
          dispatch(actions.undo());
        }
        return;
      }
      if (state.phase === 'awaitingRoll' && (key === ' ' || key === 'enter')) {
        e.preventDefault();
        dispatch(actions.roll());
      } else if (state.phase === 'question') {
        const idx = '1234'.includes(key) ? Number(key) - 1 : 'abcd'.indexOf(key);
        if (idx >= 0 && idx < state.currentQuestion.choices.length) {
          e.preventDefault();
          dispatch(actions.answer(idx));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, dispatch]);
}

function usePersistence(state) {
  useEffect(() => {
    if (SAVEABLE_PHASES.includes(state.phase)) saveGame(state);
    else if (state.phase === 'gameOver') clearGame();
  }, [state]);
}

function HostControls({ state, dispatch }) {
  return (
    <div className="host-controls">
      <button className="btn btn-small" disabled={!canUndo(state)} onClick={() => dispatch(actions.undo())}>
        ↶ Undo
      </button>
      <button
        className="btn btn-small"
        disabled={state.phase !== 'question'}
        onClick={() => dispatch(actions.skip())}
      >
        ⤼ Skip question
      </button>
      <button
        className="btn btn-small btn-quit"
        onClick={() => window.confirm('Quit to the main menu? You can resume this game from there.') && dispatch(actions.quit())}
      >
        Menu
      </button>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [savedGame, setSavedGame] = useState(loadGame);

  useEffect(preloadSounds, []);
  useAutoAdvance(state, dispatch);
  useGameSounds(state);
  useHotkeys(state, dispatch);
  usePersistence(state);

  // Refresh the "resume" option whenever we land back on the menu.
  useEffect(() => {
    if (state.phase === 'menu') setSavedGame(loadGame());
  }, [state.phase]);

  if (state.phase === 'menu') {
    return (
      <>
        <StartMenu
          onStart={() => {
            play('intro');
            dispatch(actions.startSetup());
          }}
          onResume={
            savedGame &&
            (() => {
              play('intro');
              dispatch(actions.resume(savedGame));
            })
          }
        />
        <SoundControls floating />
      </>
    );
  }

  if (state.phase === 'setup') {
    return (
      <>
        <PlayerSetup
          onStart={(config) => dispatch(actions.startGame(config))}
          onBack={() => dispatch(actions.quit())}
        />
        <SoundControls floating />
      </>
    );
  }

  if (state.phase === 'gameOver') {
    return (
      <>
        <GameOver state={state} dispatch={dispatch} />
        <SoundControls floating />
      </>
    );
  }

  const { round, maxRounds } = state;
  return (
    <div className="game">
      <Board state={state} dispatch={dispatch} />
      <aside className="side-panel">
        <div className="round-display">
          {round === maxRounds ? 'FINAL ROUND' : `ROUND ${round} / ${maxRounds}`}
        </div>
        <Scoreboard state={state} dispatch={dispatch} />
        <div className="side-spacer" />
        <HostControls state={state} dispatch={dispatch} />
        <SoundControls />
      </aside>
    </div>
  );
}
