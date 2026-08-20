import { useEffect, useRef, useState } from 'react';
import { GameShell, ScoreSummary, NeonTile, type GameProps } from './GameShell';
import { getIconSet, type IconName } from '@/blueprint/games/icons';

export function FocusGame({ theme, onFinish, index, total }: GameProps & { index: number; total: number }) {
  const iconNames = getIconSet(theme, 6);
  const [cells, setCells] = useState<{ icon: IconName; isTarget: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(1);
  const [hit, setHit] = useState<'correct' | 'wrong' | null>(null);
  const [popIndex, setPopIndex] = useState<number | null>(null);
  const moveRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const ROUNDS = 8;
  const GRID = 9;

  useEffect(() => {
    buildRound(1);
    return () => {
      if (moveRef.current) clearInterval(moveRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [done]);

  function buildRound(r: number) {
    const targetIdx = Math.floor(Math.random() * GRID);
    const arr = Array.from({ length: GRID }, (_, i) => ({
      icon: iconNames[i % iconNames.length] as IconName,
      isTarget: i === targetIdx,
    }));
    setCells(arr);
    setRound(r);
    if (moveRef.current) clearInterval(moveRef.current);
    moveRef.current = window.setInterval(() => {
      setCells((prev) => {
        if (!prev.length) return prev;
        const next = [...prev];
        for (let k = next.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1));
          [next[k], next[j]] = [next[j], next[k]];
        }
        return next;
      });
    }, 700);
  }

  function pick(i: number) {
    if (done) return;
    if (cells[i]?.isTarget) {
      setScore((s) => s + 10);
      setHit('correct');
      setPopIndex(i);
      setTimeout(() => { setHit(null); setPopIndex(null); }, 300);
      if (round >= ROUNDS) {
        setDone(true);
        if (moveRef.current) clearInterval(moveRef.current);
      } else {
        buildRound(round + 1);
      }
    } else {
      setScore((s) => Math.max(0, s - 2));
      setHit('wrong');
      setTimeout(() => setHit(null), 400);
    }
  }

  if (done) {
    return (
      <GameShell index={index} total={total} title="Focus" ability="Focus / Concentration" instructions="Click the glowing target.">
        <ScoreSummary score={score} onContinue={() => onFinish(score)} />
      </GameShell>
    );
  }

  return (
    <GameShell
      index={index}
      total={total}
      title="Focus"
      ability="Focus / Concentration"
      instructions="Click the icon marked as the target. Ignore the moving distractors."
      footer={`Round ${round}/${ROUNDS} • Score ${score}`}
    >
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-lavender-200/70">Time left</span>
        <span className={`font-display font-bold ${timeLeft <= 5 ? 'text-neon-magenta' : 'text-neon-cyan'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className={`grid grid-cols-3 gap-3 transition-all ${hit === 'correct' ? 'ring-2 ring-neon-cyan/60' : hit === 'wrong' ? 'animate-shake ring-2 ring-neon-magenta/60' : ''}`}>
        {cells.map((c, i) => (
          <div key={i} className={popIndex === i ? 'animate-pop' : ''}>
            <NeonTile
              icon={c.icon}
              active={c.isTarget}
              onClick={() => pick(i)}
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-lavender-200/50">Tap the glowing target icon.</p>
    </GameShell>
  );
}
