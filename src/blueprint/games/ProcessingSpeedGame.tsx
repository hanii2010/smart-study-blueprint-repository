import { useEffect, useRef, useState } from 'react';
import { GameShell, ScoreSummary, type GameProps } from './GameShell';
import { generateSpeedPrompts, isMathSubject, type SpeedPrompt } from '@/blueprint/games/icons';

export function ProcessingSpeedGame({ favoriteSubject, onFinish, index, total }: GameProps & { index: number; total: number }) {
  const [prompts] = useState<SpeedPrompt[]>(() => generateSpeedPrompts(favoriteSubject, 30));
  const [promptIdx, setPromptIdx] = useState(0);
  const [value, setValue] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const useMath = isMathSubject(favoriteSubject);

  useEffect(() => {
    nextPrompt();
  }, []);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  function nextPrompt() {
    setPromptIdx((i) => (i + 1) % prompts.length);
    setValue('');
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (done) return;
    const current = prompts[promptIdx];
    const userAns = value.trim().toLowerCase();
    const correctAns = current.answer.trim().toLowerCase();
    if (userAns === correctAns) {
      setScore((s) => s + 10);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setTimeout(nextPrompt, 300);
  }

  if (done) {
    return (
      <GameShell index={index} total={total} title="Processing Speed" ability="Processing Speed" instructions="Answer as many as you can.">
        <ScoreSummary score={score} onContinue={() => onFinish(score)} />
      </GameShell>
    );
  }

  const current = prompts[promptIdx];

  return (
    <GameShell
      index={index}
      total={total}
      title="Processing Speed"
      ability="Processing Speed"
      instructions={useMath ? 'Solve each problem fast. Press Enter to submit.' : 'Answer each prompt fast. Press Enter to submit.'}
      footer={`Score ${score}`}
    >
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-lavender-200/70">Time left</span>
        <span className={`font-display font-bold ${timeLeft <= 5 ? 'text-neon-magenta' : 'text-neon-cyan'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className={`mb-5 text-center transition-all ${feedback === 'correct' ? 'scale-110' : feedback === 'wrong' ? 'animate-shake' : ''}`}>
        <span
          className={`font-display text-3xl font-bold sm:text-4xl ${
            feedback === 'correct' ? 'text-neon-cyan' : feedback === 'wrong' ? 'text-neon-magenta' : 'text-white'
          }`}
        >
          {current.display}
        </span>
      </div>
      <form onSubmit={submit}>
        <input
          ref={inputRef}
          type={useMath ? 'number' : 'text'}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full rounded-xl border bg-ink-800/70 px-4 py-4 text-center font-display text-xl text-white outline-none transition-all focus:shadow-neon-purple ${
            feedback === 'correct' ? 'border-neon-cyan/60' : feedback === 'wrong' ? 'border-neon-magenta/60' : 'border-white/10 focus:border-neon-purple/60'
          }`}
          placeholder={useMath ? 'Your answer' : 'Type your answer'}
        />
      </form>
    </GameShell>
  );
}
