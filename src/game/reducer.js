import { RULES, PLAYER_COLORS } from '../config/rules.js';
import { buildSpaces, nextSpace } from './board.js';
import { draw, newDeck } from './deck.js';

const HISTORY_LIMIT = 50;

export const initialState = {
  phase: 'menu', // menu | setup | awaitingRoll | rolling | moving | question | reveal | gameOver
  players: [],
  activePlayer: 0,
  round: 1,
  maxRounds: RULES.defaultRounds,
  spaces: [],
  roll: null,
  stepsLeft: 0,
  currentQuestion: null,
  questionKind: null, // neutral | own | steal
  selectedAnswer: null, // choice index, or -1 when the timer ran out
  lastOutcome: null,
  imageZoom: false, // while a picture is enlarged, the reveal waits for the host
  deck: [],
  history: [],
  settings: { timer: false, timerSeconds: RULES.defaultTimerSeconds },
};

// Action creators. Anything random happens here, not in the reducer, so the
// reducer stays a pure function (safe for undo and future multiplayer sync).
export const actions = {
  startSetup: () => ({ type: 'START_SETUP' }),
  quit: () => ({ type: 'QUIT' }),
  resume: (saved) => ({ type: 'RESUME', saved }),
  startGame: (config) => ({ type: 'START_GAME', ...config, deck: newDeck() }),
  setActivePlayer: (playerId) => ({ type: 'SET_ACTIVE_PLAYER', playerId }),
  roll: () => ({ type: 'ROLL', value: 1 + Math.floor(Math.random() * 6) }),
  step: () => ({ type: 'STEP' }),
  land: () => ({ type: 'LAND', freshDeck: newDeck() }),
  skip: () => ({ type: 'SKIP_QUESTION', freshDeck: newDeck() }),
  answer: (index) => ({ type: 'ANSWER', index }),
  setZoom: (open) => ({ type: 'SET_ZOOM', open }),
  nextTurn: () => ({ type: 'NEXT_TURN' }),
  undo: () => ({ type: 'UNDO' }),
};

export const UNDOABLE_PHASES = ['awaitingRoll', 'reveal', 'gameOver'];
export const canUndo = (state) =>
  state.history.length > 0 && UNDOABLE_PHASES.includes(state.phase);

function kindOfSpace(state) {
  const me = state.players[state.activePlayer];
  const owner = state.spaces[me.position].owner;
  if (owner === null) return 'neutral';
  return owner === me.id ? 'own' : 'steal';
}

export function reducer(state, action) {
  switch (action.type) {
    case 'START_SETUP':
      return { ...initialState, phase: 'setup' };

    case 'QUIT':
      return initialState;

    case 'RESUME':
      return action.saved;

    case 'START_GAME': {
      const players = action.players.map((p, i) => {
        const color = PLAYER_COLORS.find((c) => c.key === p.colorKey) ?? PLAYER_COLORS[i];
        return {
          id: i,
          name: p.name.trim() || color.name,
          color: color.hex,
          textColor: color.text,
          position: 0,
          points: 0,
        };
      });
      return {
        ...initialState,
        phase: 'awaitingRoll',
        players,
        maxRounds: action.rounds,
        spaces: buildSpaces(players.length),
        deck: action.deck,
        settings: { timer: action.timer, timerSeconds: action.timerSeconds },
      };
    }

    case 'SET_ACTIVE_PLAYER':
      if (state.phase !== 'awaitingRoll') return state;
      return { ...state, activePlayer: action.playerId };

    case 'ROLL':
      if (state.phase !== 'awaitingRoll') return state;
      return { ...state, phase: 'rolling', roll: action.value, stepsLeft: action.value };

    case 'STEP': {
      if (!['rolling', 'moving'].includes(state.phase) || state.stepsLeft <= 0) return state;
      const players = state.players.map((p) =>
        p.id === state.activePlayer ? { ...p, position: nextSpace(p.position) } : p,
      );
      return { ...state, phase: 'moving', players, stepsLeft: state.stepsLeft - 1 };
    }

    case 'LAND': {
      if (state.phase !== 'moving' || state.stepsLeft > 0) return state;
      const { question, deck } = draw(state.deck, action.freshDeck);
      return {
        ...state,
        phase: 'question',
        currentQuestion: question,
        deck,
        selectedAnswer: null,
        imageZoom: false,
        questionKind: kindOfSpace(state),
      };
    }

    case 'SKIP_QUESTION': {
      if (state.phase !== 'question') return state;
      const { question, deck } = draw(state.deck, action.freshDeck);
      return { ...state, currentQuestion: question, deck, imageZoom: false };
    }

    case 'SET_ZOOM':
      if (state.phase !== 'question' && state.phase !== 'reveal') return state;
      return { ...state, imageZoom: action.open };

    case 'ANSWER': {
      if (state.phase !== 'question') return state;
      const P = RULES.points;
      const q = state.currentQuestion;
      const me = state.players[state.activePlayer];
      const spaceId = me.position;
      const owner = state.spaces[spaceId].owner;
      const correct = action.index === q.answer;

      let players = state.players;
      let spaces = state.spaces;
      const addPoints = (pid, pts) => {
        players = players.map((p) => (p.id === pid ? { ...p, points: p.points + pts } : p));
      };
      const claimSpace = () => {
        spaces = spaces.map((s) => (s.id === spaceId ? { ...s, owner: me.id } : s));
      };

      const base = {
        correct,
        timedOut: action.index < 0,
        playerId: me.id,
        spaceId,
        previousOwner: owner,
        beneficiary: null,
        points: 0,
      };
      let outcome = { ...base, type: 'miss' };

      if (owner === null) {
        if (correct) {
          claimSpace();
          addPoints(me.id, P.claim);
          outcome = { ...base, type: 'claim', beneficiary: me.id, points: P.claim };
        }
      } else if (owner === me.id) {
        if (correct) {
          addPoints(me.id, P.bonus);
          outcome = { ...base, type: 'bonus', beneficiary: me.id, points: P.bonus };
        }
      } else if (correct) {
        claimSpace();
        addPoints(me.id, P.steal);
        outcome = { ...base, type: 'steal', beneficiary: me.id, points: P.steal };
      } else {
        addPoints(owner, P.rent);
        outcome = { ...base, type: 'rent', beneficiary: owner, points: P.rent };
      }

      const { history, ...snapshot } = state;
      return {
        ...state,
        phase: 'reveal',
        players,
        spaces,
        selectedAnswer: action.index,
        lastOutcome: outcome,
        history: [...history, snapshot].slice(-HISTORY_LIMIT),
      };
    }

    case 'NEXT_TURN': {
      if (state.phase !== 'reveal') return state;
      const next = (state.activePlayer + 1) % state.players.length;
      const round = next === 0 ? state.round + 1 : state.round;
      if (round > state.maxRounds) return { ...state, phase: 'gameOver' };
      return {
        ...state,
        phase: 'awaitingRoll',
        activePlayer: next,
        round,
        stepsLeft: 0,
        currentQuestion: null,
        questionKind: null,
        selectedAnswer: null,
        lastOutcome: null,
        imageZoom: false,
      };
    }

    case 'UNDO': {
      if (!canUndo(state)) return state;
      const history = state.history.slice(0, -1);
      return { ...state.history[state.history.length - 1], history };
    }

    default:
      return state;
  }
}

export function finalStandings(state) {
  return state.players
    .map((p) => {
      const squares = state.spaces.filter((s) => s.owner === p.id).length;
      const squareBonus = squares * RULES.endBonusPerSpace;
      return { ...p, squares, squareBonus, total: p.points + squareBonus };
    })
    .sort((a, b) => b.total - a.total || b.points - a.points);
}
