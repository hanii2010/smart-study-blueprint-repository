import { Brain, Sparkles, ArrowRight, LogIn, Zap, Target, TrendingUp } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { NeonButton } from '@/components/NeonButton';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogIn: () => void;
}

export function LandingPage({ onGetStarted, onLogIn }: LandingPageProps) {
  return (
    <div className="app-bg min-h-screen">
      {/* Nav */}
      <header className="relative z-10 px-4 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <button
            onClick={onLogIn}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-lavender-100 transition-all hover:border-neon-purple/40 hover:bg-white/10 hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            Log in
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-20 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 px-3 py-1.5 text-xs font-medium text-neon-purple">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered study personalization
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Study smarter,
              <br />
              <span className="bg-gradient-to-r from-neon-purple via-neon-violet to-neon-cyan bg-clip-text text-transparent">
                not harder.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-lavender-200/70">
              Smart Study Blueprint builds a personalized learning plan around your unique profile,
              strengths, and goals — so every minute you study actually counts.
            </p>
            <p className="mt-3 max-w-md text-sm text-lavender-200/50">
              Answer a few questions, play a few quick skill games, and get a blueprint tuned to you.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <NeonButton onClick={onGetStarted} className="group">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </NeonButton>
              <NeonButton variant="outline" onClick={onLogIn}>
                I already have an account
              </NeonButton>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<Brain className="h-6 w-6" />}
            title="Cognitive assessment"
            text="8 quick games measure your memory, focus, reaction time, and more."
          />
          <FeatureCard
            icon={<Target className="h-6 w-6" />}
            title="Goal-aware planning"
            text="Tell us your target score and we tailor your plan to close the gap."
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Track progress"
            text="See how you improve over time with clear, motivating milestones."
          />
        </div>
      </section>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      {/* Glowing orb backdrop */}
      <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-neon-purple/20 via-neon-violet/10 to-neon-cyan/20 blur-3xl" />

      {/* Floating blueprint card */}
      <div className="relative animate-float">
        <div className="rounded-3xl border border-white/10 bg-ink-900/80 p-6 shadow-[0_0_60px_rgba(168,85,247,0.2)] backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-sm font-semibold text-white">Your Blueprint</span>
          </div>

          <div className="space-y-3">
            <BlueprintRow label="Profile" pct={100} color="from-neon-purple to-neon-violet" />
            <BlueprintRow label="Skill assessment" pct={75} color="from-neon-violet to-neon-cyan" />
            <BlueprintRow label="Study plan" pct={40} color="from-neon-cyan to-neon-magenta" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {['Math', 'Focus', 'Memory'].map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-xs text-lavender-200/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating accent dots */}
      <div className="absolute -right-4 top-10 h-3 w-3 animate-pulse-glow rounded-full bg-neon-cyan shadow-neon-cyan" />
      <div className="absolute -left-6 bottom-16 h-2.5 w-2.5 animate-pulse-glow rounded-full bg-neon-magenta shadow-neon-magenta" />
    </div>
  );
}

function BlueprintRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-lavender-200/70">{label}</span>
        <span className="font-medium text-white">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700/80">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-5 backdrop-blur-xl transition-all hover:border-neon-purple/30 hover:shadow-neon-purple">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-neon-purple/15 text-neon-purple">{icon}</div>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-lavender-200/60">{text}</p>
    </div>
  );
}
