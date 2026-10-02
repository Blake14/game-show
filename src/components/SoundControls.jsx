import { useState } from 'react';
import { getVolume, isMuted, play, setMuted, setVolume } from '../audio/sound.js';

export default function SoundControls({ floating = false }) {
  const [muted, setMutedState] = useState(isMuted);
  const [volume, setVolumeState] = useState(getVolume);

  return (
    <div className={`sound-controls${floating ? ' floating' : ''}`}>
      <button
        className="mute-btn"
        onClick={() => {
          setMuted(!muted);
          setMutedState(!muted);
        }}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        disabled={muted}
        aria-label="Volume"
        onChange={(e) => {
          const v = Number(e.target.value);
          setVolume(v);
          setVolumeState(v);
        }}
        onPointerUp={() => play('step')}
      />
    </div>
  );
}
