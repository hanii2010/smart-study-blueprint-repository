import { useState } from 'react';
import { GameShell, ScoreSummary, type GameProps } from './GameShell';
import { generatePatternPuzzles, shuffleArray, type PatternPuzzle } from '@/blueprint/games/icons';

export function PatternRecognitionGame({ favoriteSubject, onFinish, index, total }: GameProps & { index: number; total: number }) {
  const [deck] = useState<PatternPuzzle[]>(() => shuffleArray(generatePatternPuzzles(favoriteSubject)).slice(0, 5));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  function answer(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === deck[i].answer) {
      setScore((s) => s + 20);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      setFeedback(null);
      if (i + 1 >= deck.length) setDone(true);
      else {
        setI((x) => x + 1);
        setPicked(null);
      }
    }, 800);
  }

  if (done) {
    return (
      <GameShell index={index} total={total} title="Pattern Recognition" ability="Pattern Recognition" instructions="What comes next?">
        <ScoreSummary score={score} onContinue={() => onFinish(score)} />
      </GameShell>
    );
  }

  const p = deck[i];

  return (
    <GameShell
      index={index}
      total={total}
      title="Pattern Recognition"
      ability="Pattern Recognition"
      instructions="Look at the sequence. What comes next?"
      footer={`Puzzle ${i + 1}/${deck.length} • Score ${score}`}
    >
      <div className={`mb-6 flex flex-wrap items-center justify-center gap-2.5 transition-all ${feedback === 'wrong' ? 'animate-shake' : ''}`}>
        {p.sequence.map((item, k) => (
          <div
            key={k}
            className="grid h-14 min-w-14 place-items-center rounded-xl border border-white/10 bg-ink-800/60 px-2 font-display text-xl text-white sm:text-2xl"
          >
            {item}
          </div>
        ))}
        <div className="grid h-14 min-w-14 place-items-center rounded-xl border-2 border-dashed border-neon-purple/50 bg-neon-purple/5 font-display text-2xl text-neon-purple">
          ?
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {p.options.map((opt, idx) => {
          const isPicked = picked === idx;
          const isCorrect = idx === p.answer;
          return (
            <button
              key={idx}
              onClick={() => answer(idx)}
              disabled={picked !== null}
              className={`grid h-16 place-items-center rounded-xl border px-2 font-display text-xl transition-all duration-200 sm:text-2xl ${
                picked === null
                  ? 'border-white/10 bg-ink-800/60 text-white hover:border-neon-cyan/40 hover:bg-ink-700/60'
                  : isCorrect
                  ? 'border-neon-cyan/60 bg-neon-cyan/15 text-white shadow-neon-cyan animate-pop'
                  : isPicked
                  ? 'border-neon-magenta/60 bg-neon-magenta/15 text-white'
                  : 'border-white/10 bg-ink-800/60 text-lavender-200/50'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
