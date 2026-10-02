import QUESTIONS from '../data/questions.json';

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

export function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const newDeck = () => shuffle(QUESTIONS.map((q) => q.id));

// Takes the top card. When the deck is empty, `freshDeck` (shuffled by the
// caller, so the reducer stays pure) replaces it.
export function draw(deck, freshDeck) {
  const pile = deck.length ? deck : freshDeck;
  const [id, ...rest] = pile;
  return { question: QUESTION_BY_ID[id], deck: rest };
}
