import { useEffect, useRef, useState } from 'react';
import { GameShell, ScoreSummary, NeonTile, type GameProps, type GameIntro } from './GameShell';
import { getEmojiSet, getIconSet, type IconName } from '@/blueprint/games/icons';

const INTRO: GameIntro = {
  title: 'Spotlight Sprint',
  ability: 'Attention',
  emoji: '🔎',
  description: 'One tile is different. Find it before the countdown hits zero.',
  tips: ['Scan the whole grid once before tapping.', 'The odd tile may be a different color or shape.', 'Wrong taps cost a few points, but you can keep going.'],
  accentColor: 'cyan',
};

export function AttentionGame({ theme, onFinish, index, total }: GameProps & { index: number; total: number }) {
  const iconNames = getIconSet(theme, 6);
  const emojis = getEmojiSet(theme, 6);
  const [started, setStarted] = useState(false);
  const [grid, setGrid] = useState<number[]>([]);
  const [oddIndex, setOddIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(24);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [popIndex, setPopIndex] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const ROUNDS = 6;
  const GRID_SIZE = 9;

  function begin() { setStarted(true); nextRound(1); }
  function nextRound(r: number) {
    const base = Math.floor(Math.random() * iconNames.length);
    const odd = (base + 1 + Math.floor(Math.random() * (iconNames.length - 1))) % iconNames.length;
    const cells = Array.from({ length: GRID_SIZE }, () => base);
    const oi = Math.floor(Math.random() * GRID_SIZE);
    cells[oi] = odd;
    setGrid(cells); setOddIndex(oi); setTimeLeft(Math.max(5, 8 - r));
  }
  useEffect(() => {
    if (!started || done) return;
    timerRef.current = window.setInterval(() => setTimeLeft((t) => { if (t <= 1) { setDone(true); return 0; } return t - 1; }), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, round, done]);
  function pick(i: number) {
    if (done) return;
    if (i === oddIndex) {
      setScore((s) => s + 10); setFeedback('correct'); setPopIndex(i);
      setTimeout(() => { setFeedback(null); setPopIndex(null); }, 400);
      if (round >= ROUNDS) setDone(true); else { setRound((r) => r + 1); nextRound(round + 1); }
    } else { setScore((s) => Math.max(0, s - 3)); setFeedback('wrong'); setTimeout(() => setFeedback(null), 400); }
  }
  if (!started) return <GameShell index={index} total={total} title={INTRO.title} ability={INTRO.ability} instructions={INTRO.description} intro={INTRO} started={false} onStart={begin}>{null}</GameShell>;
  if (done) return <GameShell index={index} total={total} title="Spotlight Sprint" ability="Attention" instructions={INTRO.description}><ScoreSummary score={score} emoji="🔎" onContinue={() => onFinish(score)} /></GameShell>;
  return (
    <GameShell index={index} total={total} title="Spotlight Sprint" ability="Attention" instructions="Find the one tile that does not match." footer={`Round ${round}/${ROUNDS} • Score ${score}`}>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"><span className="text-lavender-200/70">Time left</span><span className={`font-display font-bold ${timeLeft <= 3 ? 'text-neon-magenta animate-pulse' : 'text-neon-cyan'}`}>{timeLeft}s</span></div>
      <div className={`grid grid-cols-3 gap-3 rounded-2xl p-1 transition-all ${feedback === 'correct' ? 'ring-2 ring-neon-cyan/60' : feedback === 'wrong' ? 'animate-shake ring-2 ring-neon-magenta/60' : ''}`}>
        {grid.map((iconIdx, i) => <div key={i} className={popIndex === i ? 'animate-pop' : ''}><NeonTile icon={iconNames[iconIdx] as IconName} emoji={emojis[iconIdx]} onClick={() => pick(i)} /></div>)}
      </div>
      <div className="mt-4 text-center text-sm text-lavender-200/60">{feedback === 'correct' ? '✨ Nice catch!' : feedback === 'wrong' ? 'Not that one — keep scanning!' : 'Find the odd one out.'}</div>
    </GameShell>
  );
}
