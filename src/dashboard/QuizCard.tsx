import { useState } from 'react';
import { CheckCircle2, XCircle, Trophy, Loader2, RotateCcw } from 'lucide-react';
import type { QuizQuestion } from '@/lib/gemini';

interface QuizCardProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

export function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [completed, setCompleted] = useState(false);

  const question = questions[currentIdx];
  const total = questions.length;
  const isLast = currentIdx === total - 1;

  function handleSelect(idx: number) {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);

    const correct = idx === question.correct_answer;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (isLast) {
        const finalScore = correct ? score + 1 : score;
        setFinished(true);
        if (!completed) {
          setCompleted(true);
          onComplete(finalScore, total);
        }
      }
    }, 2000);
  }

  function handleNext() {
    if (isLast) return;
    setCurrentIdx((i) => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  }

  function handleRestart() {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
    setCompleted(false);
  }

  if (finished) {
    const percentage = Math.round((score / total) * 100);
    return (
      <div className="w-full max-w-2xl animate-fade-up rounded-2xl border border-white/10 bg-ink-900/80 p-6 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className={`mb-4 grid h-20 w-20 place-items-center rounded-3xl shadow-neon-purple animate-float ${
            percentage >= 80 ? 'bg-gradient-to-br from-neon-cyan to-neon-purple' : percentage >= 50 ? 'bg-gradient-to-br from-neon-purple to-neon-violet' : 'bg-gradient-to-br from-neon-magenta to-neon-purple'
          }`}>
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold text-white">Quiz Complete!</h3>
          <p className="mt-2 text-lg text-lavender-200/70">
            You scored <span className="font-display font-bold text-neon-cyan">{score}</span> out of <span className="font-display font-bold text-white">{total}</span>
          </p>
          <div className="mt-4 w-full max-w-xs">
            <div className="h-3 w-full overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-700"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-lavender-200/50">{percentage}% correct</p>
          </div>
          <p className="mt-4 text-sm text-lavender-200/60">
            {percentage >= 80 ? 'Excellent work! You really know this material.' : percentage >= 50 ? 'Good effort! Review the ones you missed and try again.' : 'Keep practicing — you will get there!'}
          </p>
          <button
            onClick={handleRestart}
            className="mt-6 flex items-center gap-2 rounded-xl border border-neon-purple/40 bg-neon-purple/10 px-5 py-2.5 text-sm font-medium text-neon-purple transition-all hover:bg-neon-purple/20"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl animate-fade-up rounded-2xl border border-white/10 bg-ink-900/80 p-5 backdrop-blur-xl sm:p-6">
      {/* Progress */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neon-cyan">Question {currentIdx + 1} of {total}</span>
          <span className="text-lavender-200/40">Score: {score}</span>
        </div>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentIdx ? 'bg-neon-cyan' : i === currentIdx ? 'bg-neon-purple' : 'bg-ink-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h3 className="mb-5 font-display text-lg font-semibold text-white">{question.question}</h3>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === question.correct_answer;
          let className = 'border-white/10 bg-ink-800/60 text-lavender-100 hover:border-neon-purple/40 hover:bg-ink-700/60';

          if (showResult) {
            if (isCorrect) {
              className = 'border-neon-cyan/60 bg-neon-cyan/15 text-white shadow-neon-cyan';
            } else if (isSelected) {
              className = 'border-neon-magenta/60 bg-neon-magenta/15 text-white';
            } else {
              className = 'border-white/5 bg-ink-800/40 text-lavender-200/40';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${className} ${!showResult ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                showResult && isCorrect ? 'bg-neon-cyan/20 text-neon-cyan' :
                showResult && isSelected && !isCorrect ? 'bg-neon-magenta/20 text-neon-magenta' :
                'bg-white/5 text-lavender-200/50'
              }`}>
                {showResult && isCorrect ? <CheckCircle2 className="h-4 w-4" /> :
                 showResult && isSelected && !isCorrect ? <XCircle className="h-4 w-4" /> :
                 String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation + next button */}
      {showResult && (
        <div className="mt-4 animate-fade-up">
          <div className={`rounded-xl border px-4 py-3 text-sm ${
            selectedAnswer === question.correct_answer
              ? 'border-neon-cyan/30 bg-neon-cyan/5 text-lavender-100'
              : 'border-neon-magenta/30 bg-neon-magenta/5 text-lavender-100'
          }`}>
            <p className="mb-1 font-medium">
              {selectedAnswer === question.correct_answer ? '✓ Correct!' : '✗ Not quite.'}
            </p>
            <p className="text-lavender-200/70">{question.explanation}</p>
          </div>
          {!isLast && (
            <button
              onClick={handleNext}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-violet py-3 font-display font-semibold text-white shadow-neon-purple transition-all hover:-translate-y-0.5"
            >
              Next Question
            </button>
          )}
          {isLast && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-lavender-200/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calculating your score…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
