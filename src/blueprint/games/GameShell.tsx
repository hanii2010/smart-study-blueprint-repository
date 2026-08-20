import { type ReactNode, useEffect, useState } from 'react';
import { CheckCircle2, PartyPopper, Play, ArrowRight } from 'lucide-react';
import { NeonIcon, type IconName } from '@/blueprint/games/icons';

export interface GameProps {
  theme: string[];
  favoriteSubject?: string | null;
  onFinish: (score: number) => void;
}

export interface GameIntro {
  title: string;
  ability: string;
  emoji: string;
  description: string;
  tips: string[];
  accentColor: 'purple' | 'cyan' | 'magenta';
}

const ACCENT_MAP = {
  purple: { border: 'border-neon-purple/40', bg: 'bg-neon-purple/10', text: 'text-neon-purple', glow: 'shadow-neon-purple', grad: 'from-neon-purple to-neon-violet' },
  cyan: { border: 'border-neon-cyan/40', bg: 'bg-neon-cyan/10', text: 'text-neon-cyan', glow: 'shadow-neon-cyan', grad: 'from-neon-cyan to-neon-purple' },
  magenta: { border: 'border-neon-magenta/40', bg: 'bg-neon-magenta/10', text: 'text-neon-magenta', glow: 'shadow-neon-magenta', grad: 'from-neon-magenta to-neon-purple' },
};

export function GameShell({
  index,
  total,
  title,
  ability,
  instructions,
  children,
  footer,
  intro,
  onStart,
  started,
}: {
  index: number;
  total: number;
  title: string;
  ability: string;
  instructions: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  intro?: GameIntro;
  onStart?: () => void;
  started?: boolean;
}) {
  const progress = Math.round((index / total) * 100);
  const accent = intro ? ACCENT_MAP[intro.accentColor] : ACCENT_MAP.cyan;

  return (
    <div className="app-bg flex min-h-screen flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 px-4 pt-5">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-lavender-200/70">
            <span>Skill assessment</span>
            <span>{index + 1} / {total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl animate-fade-up">
          {/* Pre-game instruction screen */}
          {intro && !started ? (
            <PreGameIntro intro={intro} index={index} total={total} onStart={onStart} />
          ) : (
            <>
              <div className="mb-4 text-center">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <span className="text-2xl">{intro?.emoji}</span>
                  <span className="inline-block rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-neon-cyan">
                    {ability}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-lavender-200/70">{instructions}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:p-6">
                {children}
              </div>
              {footer && <div className="mt-4 text-center text-xs text-lavender-200/50">{footer}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PreGameIntro({
  intro,
  index,
  total,
  onStart,
}: {
  intro: GameIntro;
  index: number;
  total: number;
  onStart?: () => void;
}) {
  const accent = ACCENT_MAP[intro.accentColor];

  return (
    <div className="text-center">
      {/* Big animated emoji hero */}
      <div className={`relative mx-auto mb-6 grid h-28 w-28 place-items-center rounded-3xl bg-gradient-to-br ${accent.grad} ${accent.glow} animate-float`}>
        <span className="text-6xl drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">{intro.emoji}</span>
        {/* Floating sparkles */}
        <div className="absolute -right-2 -top-2 h-3 w-3 animate-pulse-glow rounded-full bg-neon-cyan shadow-neon-cyan" />
        <div className="absolute -bottom-1 -left-2 h-2 w-2 animate-pulse-glow rounded-full bg-neon-magenta shadow-neon-magenta" />
      </div>

      <span className={`inline-block rounded-full border ${accent.border} ${accent.bg} px-3 py-1 text-xs font-medium uppercase tracking-wider ${accent.text}`}>
        Game {index + 1} of {total}
      </span>

      <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">{intro.title}</h2>
      <p className="mx-auto mt-3 max-w-md text-base text-lavender-200/70">{intro.description}</p>

      {/* Tips */}
      <div className="mx-auto mt-6 max-w-md space-y-2">
        {intro.tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-left text-sm text-lavender-200/80 backdrop-blur-xl"
          >
            <div className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${accent.bg} ${accent.text} text-xs font-bold`}>
              {i + 1}
            </div>
            <span>{tip}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className={`group mt-8 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r ${accent.grad} px-8 py-4 font-display text-lg font-semibold text-white ${accent.glow} transition-all hover:-translate-y-0.5 hover:shadow-neon-magenta`}
      >
        <Play className="h-5 w-5 fill-white" />
        Start Game
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

/** Score summary with celebration animation. */
export function ScoreSummary({
  score,
  label = 'Your score',
  onContinue,
  emoji = '🎉',
}: {
  score: number;
  label?: string;
  onContinue: () => void;
  emoji?: string;
}) {
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setCelebrate(true);
    const t = setTimeout(() => setCelebrate(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-4 py-8 text-center animate-fade-up">
      {/* Confetti burst */}
      {celebrate && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
          <div className="animate-ping">
            <PartyPopper className="h-20 w-20 text-neon-cyan opacity-30" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${20 + Math.random() * 30}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s',
              }}
            >
              {['✨', '⭐', '💫', '🌟', '🎯', '🚀'][i]}
            </div>
          ))}
        </div>
      )}

      <div className={`text-6xl ${celebrate ? 'animate-bounce' : ''}`}>{emoji}</div>
      <div>
        <p className="text-sm text-lavender-200/70">{label}</p>
        <p className="font-display text-5xl font-bold text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">{score}</p>
      </div>
      <p className="text-sm font-medium text-neon-cyan">Nice work!</p>
      <button
        onClick={onContinue}
        className="rounded-xl bg-gradient-to-r from-neon-purple to-neon-violet px-6 py-3 font-display font-semibold text-white shadow-neon-purple transition-all hover:-translate-y-0.5 hover:shadow-neon-magenta"
      >
        Continue
      </button>
    </div>
  );
}

/** A neon game tile using custom SVG icons. */
export function NeonTile({
  icon,
  active,
  disabled,
  onClick,
  size = 'md',
  emoji,
}: {
  icon: IconName;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  emoji?: string;
}) {
  const px = size === 'sm' ? 36 : size === 'lg' ? 56 : 48;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`grid aspect-square place-items-center rounded-2xl border text-3xl transition-all duration-200 ${
        active
          ? 'border-neon-cyan bg-neon-cyan/20 shadow-neon-cyan scale-105'
          : 'border-white/10 bg-ink-800/60 hover:border-neon-purple/40 hover:bg-ink-700/60'
      } ${disabled && !active ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {emoji ?? <NeonIcon name={icon} size={px} />}
    </button>
  );
}
