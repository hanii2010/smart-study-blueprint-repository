import { useEffect, useState } from 'react';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';
import { NeonButton } from '@/components/NeonButton';

export function CognitiveTransition({ onContinue }: { onContinue: () => void }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="relative z-10 max-w-lg animate-fade-up">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple animate-float">
          <Brain className="h-10 w-10 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Now let's test a few skills
        </h1>
        <p className="mt-4 text-lavender-200/70">
          This helps us personalize everything for you. You'll play 8 short mini-games — each takes
          well under a minute.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-lavender-200/50">
          <Sparkles className="h-4 w-4 text-neon-cyan" />
          <span>Starting{count > 0 ? ` in ${count}…` : ' now'}</span>
        </div>

        <div className="mt-6">
          <NeonButton onClick={onContinue} className="group">
            Begin
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
