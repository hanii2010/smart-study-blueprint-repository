import { useEffect, useRef, useState } from 'react';
import { GameShell, ScoreSummary, type GameProps } from './GameShell';
import { getIconSet, type IconName } from '@/blueprint/games/icons';

export function ReactionTimeGame({ theme, onFinish, index, total }: GameProps & { index: number; total: number }) {
  const iconNames = getIconSet(theme, 6);
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'show' | 'result' | 'done'>('waiting');
  const [round, setRound] = useState(1);
  const [times, setTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [tooSoon, setTooSoon] = useState(false);
  const [currentIcon, setCurrentIcon] = useState<IconName>(iconNames[0]);
  const startTime = useRef(0);
  const timeout = useRef<number | null>(null);

  const ROUNDS = 4;

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  function arm() {
    setPhase('ready');
    setTooSoon(false);
    setCurrentIcon(iconNames[Math.floor(Math.random() * iconNames.length)]);
    const delay = 1200 + Math.random() * 2500;
    timeout.current = window.setTimeout(() => {
      startTime.current = performance.now();
      setPhase('show');
    }, delay);
  }

  function click() {
    if (phase === 'waiting') {
      arm();
    } else if (phase === 'ready') {
      if (timeout.current) clearTimeout(timeout.current);
      setTooSoon(true);
      setPhase('waiting');
    } else if (phase === 'show') {
      const t = Math.round(performance.now() - startTime.current);
      setLastTime(t);
      setTimes((prev) => [...prev, t]);
      setPhase('result');
    }
  }

  function next() {
    if (round >= ROUNDS) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      setPhase('done');
      onFinish(avg);
    } else {
      setRound((r) => r + 1);
      setPhase('waiting');
    }
  }

  if (phase === 'done') {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    return (
      <GameShell index={index} total={total} title="Reaction Time" ability="Reaction Time" instructions="Tap as fast as you can.">
        <ScoreSummary score={avg} label="Average reaction time (ms)" onContinue={() => onFinish(avg)} />
      </GameShell>
    );
  }

  const surface =
    phase === 'show'
      ? 'bg-neon-cyan/20 border-neon-cyan/60 shadow-neon-cyan cursor-pointer'
      : phase === 'ready'
      ? 'bg-neon-magenta/10 border-neon-magenta/40'
      : 'bg-ink-800/60 border-white/10 hover:border-neon-purple/40';

  return (
    <GameShell
      index={index}
      total={total}
      title="Reaction Time"
      ability="Reaction Time"
      instructions="Wait for the icon to appear, then tap as fast as you can. Don't tap early!"
      footer={`Round ${round}/${ROUNDS} • ${times.length ? `Last: ${lastTime}ms` : 'Tap to start'}`}
    >
      <button
        onClick={() => (phase === 'result' ? next() : click())}
        className={`grid h-56 w-full place-items-center rounded-2xl border-2 transition-all duration-200 ${surface}`}
      >
        {phase === 'waiting' && (
          <span className="font-display text-lg font-semibold text-lavender-100">
            {tooSoon ? 'Too soon! Tap to try again.' : 'Tap here to start'}
          </span>
        )}
        {phase === 'ready' && (
          <span className="font-display text-lg font-semibold text-neon-magenta">Wait for it…</span>
        )}
        {phase === 'show' && (
          <div className="animate-pop">
            <svg width="72" height="72" viewBox="0 0 48 48" style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.7))' }}>
              <defs>
                <linearGradient id="rt-icon" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <g fill="url(#rt-icon)">
                {renderIcon(currentIcon)}
              </g>
            </svg>
          </div>
        )}
        {phase === 'result' && (
          <div className="text-center animate-pop">
            <p className="text-sm text-lavender-200/70">Your time</p>
            <p className="font-display text-4xl font-bold text-neon-cyan">{lastTime}ms</p>
            <p className="mt-3 text-xs text-lavender-200/60">
              {round >= ROUNDS ? 'Tap to finish' : 'Tap for next round'}
            </p>
          </div>
        )}
      </button>
    </GameShell>
  );
}

function renderIcon(name: IconName): React.ReactNode {
  switch (name) {
    case 'circle':
      return <circle cx="24" cy="24" r="16" />;
    case 'triangle':
      return <polygon points="24,6 42,40 6,40" />;
    case 'square':
      return <rect x="8" y="8" width="32" height="32" rx="4" />;
    case 'diamond':
      return <polygon points="24,4 44,24 24,44 4,24" />;
    case 'hexagon':
      return <polygon points="24,4 41,14 41,34 24,44 7,34 7,14" />;
    case 'star':
      return <polygon points="24,3 29,18 45,18 32,28 37,44 24,34 11,44 16,28 3,18 19,18" />;
    case 'bolt':
      return <polygon points="26,4 10,26 22,26 18,44 38,20 26,20" />;
    default:
      return <circle cx="24" cy="24" r="16" />;
  }
}
