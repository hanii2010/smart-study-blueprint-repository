import { useMemo, useState } from 'react';
import { Check, ChevronRight, Plus, X } from 'lucide-react';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import {
  QUESTIONS,
  HOBBY_SKILL_MAP,
  type Question,
  type ProfileAnswers,
} from '@/blueprint/profileQuestions';

interface ProfileFlowProps {
  initialAnswers: ProfileAnswers;
  initialStep: number;
  onComplete: (answers: ProfileAnswers) => Promise<void> | void;
  onStepChange?: (step: number) => Promise<void> | void;
}

export function ProfileFlow({ initialAnswers, initialStep, onComplete, onStepChange }: ProfileFlowProps) {
  const [step, setStep] = useState(initialStep);
  const [answers, setAnswers] = useState<ProfileAnswers>(initialAnswers);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const question = QUESTIONS[step];
  const total = QUESTIONS.length;
  const progress = Math.round((step / total) * 100);

  const currentAnswer = answers[question.key];

  function go(next: number) {
    setDirection(next > step ? 'forward' : 'back');
    setCustomTag('');
    const nextStep = Math.max(0, Math.min(total - 1, next));
    setStep(nextStep);
    void onStepChange?.(nextStep);
  }

  function setAnswer(value: string | string[] | number | null) {
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  }

  async function finish() {
    setSaving(true);
    try {
      await onComplete(answers);
    } finally {
      setSaving(false);
    }
  }

  const isValid = useMemo(() => validate(question, currentAnswer), [question, currentAnswer]);

  return (
    <div className="app-bg flex min-h-screen flex-col">
      {/* progress bar */}
      <div className="sticky top-0 z-20 px-4 pt-5">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-lavender-200/70">
            <span>Profile setup</span>
            <span>{step + 1} / {total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-purple via-neon-violet to-neon-cyan transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* chat area */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div
          key={step}
          className={`w-full max-w-2xl ${direction === 'forward' ? 'animate-fade-up' : 'animate-fade-in'}`}
        >
          <QuestionBubble prompt={question.prompt} />

          <div className="mt-5 rounded-2xl border border-white/10 bg-ink-900/70 p-5 shadow-[0_0_30px_rgba(168,85,247,0.12)] backdrop-blur-xl sm:p-6">
            <AnswerField
              question={question}
              answers={answers}
              value={currentAnswer}
              onChange={setAnswer}
              customTag={customTag}
              setCustomTag={setCustomTag}
            />

            <div className="mt-6 flex items-center justify-between gap-3">
              <NeonButton
                variant="ghost"
                onClick={() => (step > 0 ? go(step - 1) : undefined)}
                disabled={step === 0 || saving}
                className="px-3 py-2"
              >
                Back
              </NeonButton>

              {step < total - 1 ? (
                <NeonButton
                  onClick={() => go(step + 1)}
                  disabled={!isValid}
                  className="group"
                >
                  Next
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </NeonButton>
              ) : (
                <NeonButton onClick={finish} disabled={!isValid || saving}>
                  {saving ? 'Saving…' : 'Continue'}
                </NeonButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionBubble({ prompt }: { prompt: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple" />
      <div className="rounded-2xl rounded-tl-sm border border-neon-purple/30 bg-ink-800/80 px-5 py-3.5 text-lg font-medium text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        {prompt}
      </div>
    </div>
  );
}

function AnswerField({
  question,
  answers,
  value,
  onChange,
  customTag,
  setCustomTag,
}: {
  question: Question;
  answers: ProfileAnswers;
  value: string | string[] | number | null | undefined;
  onChange: (v: string | string[] | number | null) => void;
  customTag: string;
  setCustomTag: (v: string) => void;
}) {
  const options = resolveOptions(question, answers);

  if (question.type === 'text') {
    return (
      <NeonInput
        autoFocus
        type="text"
        placeholder={question.placeholder}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (question.type === 'number') {
    return (
      <NeonInput
        autoFocus
        type="number"
        inputMode="numeric"
        min={question.min}
        max={question.max}
        placeholder={question.placeholder}
        value={value === null || value === undefined ? '' : String(value)}
        onChange={(e) => {
          const n = e.target.value === '' ? null : Number(e.target.value);
          onChange(n);
        }}
      />
    );
  }

  if (question.type === 'single' || question.type === 'single-custom') {
    const isCustom = question.type === 'single-custom' && question.allowCustom;
    return (
      <SingleSelectField
        options={options}
        value={(value as string) ?? null}
        onChange={onChange}
        allowCustom={isCustom}
        customTag={customTag}
        setCustomTag={setCustomTag}
      />
    );
  }

  // multi / multi-custom
  const selected = Array.isArray(value) ? value : [];
  const isCustom = question.type === 'multi-custom' && question.allowCustom;

  function toggle(opt: string) {
    const set = new Set(selected);
    if (set.has(opt)) set.delete(opt);
    else set.add(opt);
    onChange(Array.from(set));
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'border-neon-cyan/60 bg-neon-cyan/15 text-white shadow-neon-cyan'
                  : 'border-white/10 bg-ink-800/60 text-lavender-200/80 hover:border-neon-cyan/40 hover:bg-ink-700/60'
              }`}
            >
              <span>{opt}</span>
              {active && <Check className="h-4 w-4 text-neon-cyan" />}
            </button>
          );
        })}
      </div>

      {isCustom && (
        <div className="mt-3">
          <CustomTagRow
            customTag={customTag}
            setCustomTag={setCustomTag}
            selected={selected}
            onAdd={(tag) => {
              toggle(tag);
              setCustomTag('');
            }}
            onRemove={(tag) => toggle(tag)}
          />
        </div>
      )}
    </div>
  );
}

function SingleSelectField({
  options,
  value,
  onChange,
  allowCustom,
  customTag,
  setCustomTag,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  allowCustom?: boolean;
  customTag: string;
  setCustomTag: (v: string) => void;
}) {
  const knownOptions = new Set(options);
  const customValue = value && !knownOptions.has(value) ? value : null;

  function select(opt: string) {
    onChange(opt);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => select(opt)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                selected
                  ? 'border-neon-purple/60 bg-neon-purple/20 text-white shadow-neon-purple'
                  : 'border-white/10 bg-ink-800/60 text-lavender-200/80 hover:border-neon-purple/40 hover:bg-ink-700/60'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {allowCustom && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-lavender-200/50">Don't see yours? Type it below.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customValue ?? customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (customTag.trim() || (customValue && customTag.trim()))) {
                  e.preventDefault();
                  const tag = customTag.trim() || customValue?.trim() || '';
                  if (tag) select(tag);
                }
              }}
              placeholder="Type a custom subject (press Enter)"
              className="flex-1 rounded-xl border border-white/10 bg-ink-800/70 px-3 py-2.5 text-sm text-white placeholder:text-lavender-200/30 outline-none transition-all focus:border-neon-purple/60 focus:shadow-neon-purple"
            />
            <button
              type="button"
              onClick={() => {
                const tag = customTag.trim() || customValue?.trim() || '';
                if (tag) select(tag);
              }}
              className="grid h-10 w-10 place-items-center rounded-xl border border-neon-purple/40 bg-neon-purple/10 text-neon-purple transition-all hover:bg-neon-purple/20"
              aria-label="Add custom subject"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {customValue && (
            <p className="mt-2 text-xs text-neon-cyan">
              Selected: <span className="font-medium">{customValue}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CustomTagRow({
  customTag,
  setCustomTag,
  selected,
  onAdd,
  onRemove,
}: {
  customTag: string;
  setCustomTag: (v: string) => void;
  selected: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const customTags = selected.filter((t) => !isKnownTag(t));

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customTag.trim()) {
              e.preventDefault();
              onAdd(customTag.trim());
            }
          }}
          placeholder="Add your own (press Enter)"
          className="flex-1 rounded-xl border border-white/10 bg-ink-800/70 px-3 py-2.5 text-sm text-white placeholder:text-lavender-200/30 outline-none transition-all focus:border-neon-purple/60 focus:shadow-neon-purple"
        />
        <button
          type="button"
          onClick={() => customTag.trim() && onAdd(customTag.trim())}
          className="grid h-10 w-10 place-items-center rounded-xl border border-neon-purple/40 bg-neon-purple/10 text-neon-purple transition-all hover:bg-neon-purple/20"
          aria-label="Add custom tag"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {customTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {customTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-neon-magenta/40 bg-neon-magenta/10 px-3 py-1.5 text-xs text-neon-magenta"
            >
              {tag}
              <button type="button" onClick={() => onRemove(tag)} aria-label={`Remove ${tag}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function resolveOptions(question: Question, answers: ProfileAnswers): string[] {
  if (question.optionsFrom === 'subjects') {
    const subs = (answers.subjects as string[]) ?? [];
    return subs.length ? subs : [];
  }
  if (question.optionsFrom === 'hobbies') {
    const hobbies = (answers.hobbies as string[]) ?? [];
    const set = new Set<string>();
    hobbies.forEach((h) => {
      const known = HOBBY_SKILL_MAP[h];
      if (known) known.forEach((s) => set.add(s));
    });
    return Array.from(set);
  }
  return [...(question.options ?? [])];
}

function isKnownTag(tag: string): boolean {
  const known = new Set<string>([
    ...QUESTIONS.flatMap((q) => [...(q.options ?? [])]),
    ...Object.values(HOBBY_SKILL_MAP).flat(),
  ]);
  return known.has(tag);
}

function validate(question: Question, value: string | string[] | number | null | undefined): boolean {
  if (question.type === 'text') return !!value && String(value).trim().length > 0;
  if (question.type === 'number') {
    if (value === null || value === undefined || value === '') return false;
    const n = Number(value);
    if (Number.isNaN(n)) return false;
    if (question.min !== undefined && n < question.min) return false;
    if (question.max !== undefined && n > question.max) return false;
    return true;
  }
  if (question.type === 'single' || question.type === 'single-custom') return !!value && String(value).length > 0;
  // multi
  const arr = Array.isArray(value) ? value : [];
  const min = question.minSelections ?? 1;
  return arr.length >= min;
}
