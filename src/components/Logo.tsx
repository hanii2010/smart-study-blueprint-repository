export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 2 8l10 5 10-5-10-5Z" />
          <path d="M2 12l10 5 10-5" />
          <path d="M2 16l10 5 10-5" />
        </svg>
      </div>
      <span className="font-display text-lg font-semibold tracking-tight text-white">
        Smart Study <span className="text-neon-cyan">Blueprint</span>
      </span>
    </div>
  );
}
