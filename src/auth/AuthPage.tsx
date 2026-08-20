import { useState, type FormEvent } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { Logo } from '@/components/Logo';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fn = mode === 'signup' ? signUp : signIn;
    const { error: err } = await fn(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <div className="app-bg flex items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-7 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-xl">
          <div className="mb-6 flex rounded-xl bg-ink-800/80 p-1">
            <TabButton active={mode === 'signup'} onClick={() => setMode('signup')}>
              Sign up
            </TabButton>
            <TabButton active={mode === 'login'} onClick={() => setMode('login')}>
              Log in
            </TabButton>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <NeonInput
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <NeonInput
              label="Password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="rounded-lg border border-neon-magenta/40 bg-neon-magenta/10 px-3 py-2 text-sm text-neon-magenta">
                {error}
              </p>
            )}

            <NeonButton type="submit" disabled={busy} className="w-full">
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
            </NeonButton>
          </form>

          <p className="mt-5 text-center text-xs text-lavender-200/50">
            {mode === 'signup'
              ? 'Already have an account? Switch to Log in.'
              : "Don't have an account yet? Switch to Sign up."}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-lavender-200/40">
          Your personalized study plan starts here.
        </p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-neon-purple'
          : 'text-lavender-200/70 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
