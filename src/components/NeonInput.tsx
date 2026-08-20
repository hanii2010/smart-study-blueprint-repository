import { type InputHTMLAttributes } from 'react';

interface NeonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function NeonInput({ label, className = '', ...props }: NeonInputProps) {
  return (
    <label className="block w-full">
      {label && (
        <span className="mb-2 block text-sm font-medium text-lavender-200/80">{label}</span>
      )}
      <input
        className={`w-full rounded-xl border border-white/10 bg-ink-800/70 px-4 py-3 text-white placeholder:text-lavender-200/30 outline-none transition-all duration-300 focus:border-neon-purple/60 focus:shadow-neon-purple ${className}`}
        {...props}
      />
    </label>
  );
}
