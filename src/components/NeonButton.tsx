import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'outline';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function NeonButton({
  variant = 'primary',
  className = '',
  children,
  disabled,
  ...props
}: NeonButtonProps) {
  const base =
    'relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/60 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<Variant, string> = {
    primary:
      'text-white bg-gradient-to-r from-neon-purple to-neon-violet shadow-neon-purple hover:shadow-neon-magenta hover:-translate-y-0.5',
    outline:
      'text-lavender-100 border border-neon-purple/50 bg-white/5 hover:bg-white/10 hover:shadow-neon-purple hover:-translate-y-0.5',
    ghost: 'text-lavender-200 hover:text-white hover:bg-white/5',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
