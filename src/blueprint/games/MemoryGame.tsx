import { useEffect, useRef, useState } from 'react';
import { GameShell, ScoreSummary, NeonTile, type GameProps, type GameIntro } from './GameShell';
import { getEmojiSet, getIconSet, type IconName } from '@/blueprint/games/icons';

const INTRO: GameIntro = {
  title: 'Memory Mission',
  ability: 'Memory',
  emoji: '🧠',
  description: 'Watch the neon trail, then replay it from memory. Each round adds one more beat.',
  tips: ['Focus on the glowing order, not just the icons.', 'Tap the exact sequence when it is your turn.', 'Make it through 5 rounds to unlock your score.'],
  accentColor: 'purple',
};

export function MemoryGame({ theme, onFinish, index, total }: GameProps & { index: number; total: number }) {
  const iconNames = getIconSet(theme, 6);
  const emojis = getEmojiSet(theme, 6);
  const [started, setStarted] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<'show' | 'input' | 'done'>('show');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [showing, setShowing] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timers = useRef<number[]>([]);
  const MAX_ROUNDS = 5;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function begin() {
    setStarted(true);
    startRound(1);
  }

  function startRound(r: number) {
    const len = r + 1;
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * iconNames.length));
    setSequence(seq);
    setUserIndex(0);
    setPhase('show');
    setShowing(true);
    playSequence(seq);
  }

  function playSequence(seq: number[]) {
    seq.forEach((tile, i) => {
      const t = window.setTimeout(() => {
        setActive(tile);
        window.setTimeout(() => setActive(null), 430);
      }, 650 * i + 450);
      timers.current.push(t);
    });
    const end = window.setTimeout(() => {
      setShowing(false);
      setPhase('input');
    }, 650 * seq.length + 450);
    timers.current.push(end);
  }

  function handleClick(i: number) {
    if (phase !== 'input' || showing) return;
    setActive(i);
    setTimeout(() => setActive(null), 200);
    if (i === sequence[userIndex]) {
      setFeedback('correct');
      setTimeout(() => setFeedback(null), 300);
      const next = userIndex + 1;
      if (next === sequence.length) {
        setScore((s) => s + sequence.length * 10);
        if (round >= MAX_ROUNDS) setPhase('done');
        else {
          setRound((r) => r + 1);
          setTimeout(() => startRound(round + 1), 600);
        }
      } else setUserIndex(next);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 400);
      setPhase('done');
    }
  }

  if (!started) return <GameShell index={index} total={total} title={INTRO.title} ability={INTRO.ability} instructions={INTRO.description} intro={INTRO} started={false} onStart={begin}>{null}</GameShell>;
  if (phase === 'done') return <GameShell index={index} total={total} title="Memory Mission" ability="Memory" instructions={INTRO.description}><ScoreSummary score={score} emoji="🧠" onContinue={() => onFinish(score)} /></GameShell>;

  return (
    <GameShell index={index} total={total} title="Memory Mission" ability="Memory" instructions="Watch the sequence light up, then tap the icons in the same order." footer={phase === 'show' ? 'Watch carefully…' : `Round ${round} — tap ${userIndex + 1}/${sequence.length}`}>
      <div className={`mb-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-lavender-200/70 ${feedback === 'wrong' ? 'animate-shake border-neon-magenta/60' : feedback === 'correct' ? 'border-neon-cyan/60' : ''}`}>
        <span className="text-xl">{feedback === 'wrong' ? '💥' : feedback === 'correct' ? '✨' : '👀'}</span>
        <span>{feedback === 'wrong' ? 'So close! Watch the next run.' : feedback === 'correct' ? 'Perfect beat!' : phase === 'show' ? 'Watch the neon trail' : 'Your turn — replay it!'}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {iconNames.map((icon, i) => <NeonTile key={i} icon={icon as IconName} emoji={emojis[i]} active={active === i} disabled={phase !== 'input'} onClick={() => handleClick(i)} />)}
      </div>
    </GameShell>
  );
}
