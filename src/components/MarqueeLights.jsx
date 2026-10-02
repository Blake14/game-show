const dots = (n) => Array.from({ length: n }, (_, i) => <span key={i} className="light" />);

// Chasing bulbs around the edge of the nearest positioned parent.
export default function MarqueeLights({ across = 24, down = 12, fast = false }) {
  const cls = `lights${fast ? ' fast' : ''}`;
  return (
    <>
      <div className={`${cls} lights-top`}>{dots(across)}</div>
      <div className={`${cls} lights-right`}>{dots(down)}</div>
      <div className={`${cls} lights-bottom`}>{dots(across)}</div>
      <div className={`${cls} lights-left`}>{dots(down)}</div>
    </>
  );
}
