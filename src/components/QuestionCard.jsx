import { useLayoutEffect, useRef, useState } from 'react';
import { RULES } from '../config/rules.js';
import { actions } from '../game/reducer.js';

const LETTERS = 'ABCD';
const P = RULES.points;
const FIT_STEPS = [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.45];
const LONG_CHOICE = 26; // characters; past this, answers stack in one column

// The path as written, then the same name with other common extensions,
// so "photo.jpeg" still loads if the file is really "photo.jpg" or ".png".
function imageCandidates(src) {
  const base = src.replace(/\.(jpe?g|png|webp|gif|svg)$/i, '');
  const alts = ['jpg', 'jpeg', 'png', 'webp'].map((ext) => `${base}.${ext}`);
  return [...new Set([src, ...alts])];
}

// Shrinks the card's text (via the --fit CSS variable) until nothing overflows.
function useFitText(ref, deps) {
  useLayoutEffect(() => {
    const card = ref.current;
    if (!card) return;
    const fit = () => {
      for (const f of FIT_STEPS) {
        card.style.setProperty('--fit', f);
        const tooTall = card.scrollHeight > card.clientHeight + 1;
        const tooWide = [...card.querySelectorAll('.choice, .qc-prompt')].some((el) => el.scrollWidth > el.clientWidth + 1);
        if (!tooTall && !tooWide) break;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, deps);
}

function Name({ player }) {
  return (
    <strong className="name-chip" style={{ '--c': player.color, '--fg': player.textColor }}>
      {player.name}
    </strong>
  );
}

function StakesLine({ kind, owner }) {
  if (kind === 'own') return <span>Your square · correct = <b>BONUS +{P.bonus}</b></span>;
  if (kind === 'steal')
    return (
      <span>
        <Name player={owner} />'s square · <b>STEAL IT +{P.steal}</b> · miss = rent +{P.rent} to them
      </span>
    );
  return <span>Open square · <b>CLAIM IT +{P.claim}</b></span>;
}

function OutcomeLine({ outcome, players }) {
  const me = players[outcome.playerId];
  const owner = outcome.previousOwner === null ? null : players[outcome.previousOwner];
  const prefix = outcome.timedOut ? "TIME'S UP! " : '';
  switch (outcome.type) {
    case 'claim':
      return <span className="good"><Name player={me} /> claims it! +{outcome.points}</span>;
    case 'bonus':
      return <span className="good">Bonus! <Name player={me} /> +{outcome.points}</span>;
    case 'steal':
      return <span className="good">STOLEN! <Name player={me} /> +{outcome.points}</span>;
    case 'rent':
      return <span className="bad">{prefix}Rent! <Name player={owner} /> collects +{outcome.points}</span>;
    default:
      return <span className="bad">{prefix || 'Nope! '}No points this time</span>;
  }
}

export default function QuestionCard({ state, dispatch }) {
  const { currentQuestion: q, phase, selectedAnswer, questionKind, lastOutcome, players, activePlayer, spaces, settings } =
    state;
  const cardRef = useRef(null);
  const candidates = q.image ? imageCandidates(q.image) : [];
  const [srcIndex, setSrcIndex] = useState(0);
  const reveal = phase === 'reveal';
  const me = players[activePlayer];
  const ownerId = spaces[me.position].owner;
  const owner = ownerId === null ? null : players[ownerId];
  const src = candidates[srcIndex];
  const showImage = Boolean(src);
  const zoomed = state.imageZoom && showImage;
  const longChoices = q.choices.some((c) => c.length > LONG_CHOICE);

  useFitText(cardRef, [q.id, reveal, showImage]);

  const onImageError = () => {
    if (srcIndex + 1 >= candidates.length) console.warn(`Image not found for ${q.id}: ${q.image}`);
    setSrcIndex((i) => i + 1);
  };

  const cls = ['question-card', showImage && 'has-image', longChoices && 'long-choices'].filter(Boolean).join(' ');

  return (
    <div className={cls} ref={cardRef}>
      <div className="qc-header">
        <span className="qc-category">{q.category}</span>
        <span className={`qc-kind${reveal ? ' qc-outcome' : ''}`}>
          {reveal ? <OutcomeLine outcome={lastOutcome} players={players} /> : <StakesLine kind={questionKind} owner={owner} />}
        </span>
      </div>

      <div className="qc-body">
        {showImage && (
          <button className="qc-image" onClick={() => dispatch(actions.setZoom(true))} title="Click to enlarge">
            <img src={src} alt="" onError={onImageError} />
          </button>
        )}

        <div className="qc-main">
          <p className="qc-prompt">{q.prompt}</p>

          <div className="qc-choices">
            {q.choices.map((choice, i) => {
              let choiceCls = 'choice';
              if (reveal) {
                if (i === q.answer) choiceCls += ' correct';
                else if (i === selectedAnswer) choiceCls += ' wrong';
                else choiceCls += ' dim';
              }
              return (
                <button key={i} className={choiceCls} disabled={reveal} onClick={() => dispatch(actions.answer(i))}>
                  <span className="choice-letter">{LETTERS[i]}</span>
                  <span className="choice-text">{choice}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {phase === 'question' && settings.timer && (
        <div className="timer">
          <div className="timer-fill" style={{ animationDuration: `${settings.timerSeconds}s` }} />
        </div>
      )}

      {zoomed && (
        <button className="qc-zoom" onClick={() => dispatch(actions.setZoom(false))} title="Click to close">
          <img src={src} alt="" />
          <span className="qc-zoom-caption">
            {reveal ? (
              <>
                ✓ {q.choices[q.answer]} <em>· click to close &amp; continue</em>
              </>
            ) : (
              <em>Click the picture or press Esc to close</em>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
