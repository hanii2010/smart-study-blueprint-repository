import { useEffect, useState } from 'react';
import { GameShell, ScoreSummary, type GameProps } from './GameShell';
import { generateRecallCards, shuffleArray, type RecallCard } from '@/blueprint/games/icons';

export function ActiveRecallGame({ theme, favoriteSubject, onFinish, index, total }: GameProps & { index: number; total: number }) {
  const [deck] = useState<RecallCard[]>(() => shuffleArray(generateRecallCards(favoriteSubject)).slice(0, 5));
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'show' | 'ask' | 'done'>('show');
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [showTime, setShowTime] = useState(3);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (phase !== 'show') return;
    setShowTime(3);
    const t = setInterval(() => {
      setShowTime((t) => {
        if (t <= 1) {
          clearInterval(t);
          setPhase('ask');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, i]);

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
      if (i + 1 >= deck.length) {
        setPhase('done');
      } else {
        setI((x) => x + 1);
        setPicked(null);
        setPhase('show');
      }
    }, 900);
  }

  if (phase === 'done') {
    return (
      <GameShell index={index} total={total} title="Active Recall" ability="Active Recall" instructions="Recall what you just saw.">
        <ScoreSummary score={score} onContinue={() => onFinish(score)} />
      </GameShell>
    );
  }

  const card = deck[i];

  return (
    <GameShell
      index={index}
      total={total}
      title="Active Recall"
      ability="Active Recall"
      instructions="Memorize the fact shown briefly, then answer the question."
      footer={`Card ${i + 1}/${deck.length} • Score ${score}`}
    >
      <div className={`min-h-[160px] transition-all ${feedback === 'wrong' ? 'animate-shake' : ''}`}>
        {phase === 'show' ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center animate-fade-in">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-display text-lg font-semibold text-white">{card.fact}</p>
            <p className="text-sm text-neon-cyan">Memorize this… {showTime}s</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center animate-fade-up">
            <p className="font-display text-lg font-semibold text-white">What did you just read?</p>
            <p className="text-sm text-lavender-200/70">"{card.fact}"</p>
            <div className="grid w-full grid-cols-2 gap-3">
              {card.options.map((opt, idx) => {
                const isPicked = picked === idx;
                const isCorrect = idx === card.answer;
                return (
                  <button
                    key={opt}
                    onClick={() => answer(idx)}
                    disabled={picked !== null}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      picked === null
                        ? 'border-white/10 bg-ink-800/60 text-lavender-200/80 hover:border-neon-purple/40 hover:bg-ink-700/60'
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
          </div>
        )}
      </div>
    </GameShell>
  );
}
