import { useEffect, useState } from 'react';

// Pip positions on a 3x3 grid (0 = top-left, 8 = bottom-right).
const PIPS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function Dice({ value, rolling }) {
  const [tumbleFace, setTumbleFace] = useState(1);

  useEffect(() => {
    if (!rolling) return;
    const t = setInterval(
      () =>
        setTumbleFace((f) => {
          let n;
          do n = 1 + Math.floor(Math.random() * 6);
          while (n === f);
          return n;
        }),
      80,
    );
    return () => clearInterval(t);
  }, [rolling]);

  const face = rolling ? tumbleFace : value;
  if (!face) {
    return (
      <div className="die die-blank" aria-label="Die">
        ?
      </div>
    );
  }
  return (
    <div className={`die${rolling ? ' rolling' : ' landed'}`} aria-label={`Die showing ${face}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={PIPS[face].includes(i) ? 'pip' : 'pip-empty'} />
      ))}
    </div>
  );
}
