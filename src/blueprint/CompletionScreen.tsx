import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { NeonButton } from '@/components/NeonButton';

export function CompletionScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="relative z-10 max-w-lg animate-fade-up">
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple animate-float">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
          Blueprint Completed!
        </h1>
        <p className="mt-4 text-lavender-200/70">
          Your profile and skill assessment are done. We've personalized everything for you.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 text-left">
          <SummaryCard icon="user" label="Profile" text="Saved" />
          <SummaryCard icon="brain" label="Skill assessment" text="8 games complete" />
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-neon-cyan">
          <Sparkles className="h-4 w-4" />
          <span>You're all set</span>
        </div>

        <div className="mt-6">
          <NeonButton onClick={onContinue} className="group">
            Continue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </NeonButton>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-wider text-neon-cyan">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-white">{text}</p>
    </div>
  );
}
