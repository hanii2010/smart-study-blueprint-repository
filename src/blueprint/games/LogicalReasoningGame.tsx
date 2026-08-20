import { useState } from 'react';
import { GameShell, ScoreSummary, type GameProps } from './GameShell';
import { generateRiddles, shuffleArray, type Riddle } from '@/blueprint/games/icons';

export function LogicalReasoningGame({ favoriteSubject, onFinish, index, total }: GameProps & { index: number; total: number }) {
  const [deck] = useState<Riddle[]>(() => shuffleArray(generateRiddles(favoriteSubject)).slice(0, 5));
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
      <GameShell index={index} total={total} title="Logical Reasoning" ability="Logical Reasoning" instructions="Solve each riddle.">
        <ScoreSummary score={score} onContinue={() => onFinish(score)} />
      </GameShell>
    );
  }

  const r = deck[i];

  return (
    <GameShell
      index={index}
      total={total}
      title="Logical Reasoning"
      ability="Logical Reasoning"
      instructions="Pick the answer that makes the most sense."
      footer={`Riddle ${i + 1}/${deck.length} • Score ${score}`}
    >
      <div className={`mb-5 text-center transition-all ${feedback === 'wrong' ? 'animate-shake' : ''}`}>
        <p className="font-display text-lg font-semibold text-white">{r.question}</p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {r.options.map((opt, idx) => {
          const isPicked = picked === idx;
          const isCorrect = idx === r.answer;
          return (
            <button
              key={idx}
              onClick={() => answer(idx)}
              disabled={picked !== null}
              className={`rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                picked === null
                  ? 'border-white/10 bg-ink-800/60 text-lavender-100 hover:border-neon-purple/40 hover:bg-ink-700/60'
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
