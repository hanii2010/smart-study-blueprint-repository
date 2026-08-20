import { useState } from 'react';
import { supabase, COGNITIVE_ABILITIES, type CognitiveAbility } from '@/lib/supabase';
import { MemoryGame } from '@/blueprint/games/MemoryGame';
import { AttentionGame } from '@/blueprint/games/AttentionGame';
import { ActiveRecallGame } from '@/blueprint/games/ActiveRecallGame';
import { ProcessingSpeedGame } from '@/blueprint/games/ProcessingSpeedGame';
import { FocusGame } from '@/blueprint/games/FocusGame';
import { PatternRecognitionGame } from '@/blueprint/games/PatternRecognitionGame';
import { LogicalReasoningGame } from '@/blueprint/games/LogicalReasoningGame';
import { ReactionTimeGame } from '@/blueprint/games/ReactionTimeGame';
import type { GameProps } from '@/blueprint/games/GameShell';

interface CognitiveFlowProps {
  userId: string;
  hobbies: string[];
  favoriteSubject: string | null;
  startIndex: number;
  onComplete: () => Promise<void> | void;
  onStepChange?: (step: number) => Promise<void> | void;
}

const TOTAL = COGNITIVE_ABILITIES.length;

export function CognitiveFlow({ userId, hobbies, favoriteSubject, startIndex, onComplete, onStepChange }: CognitiveFlowProps) {
  const [index, setIndex] = useState(startIndex);
  const [scores, setScores] = useState<Record<string, number>>({});

  async function saveScore(ability: CognitiveAbility, score: number) {
    const { error } = await supabase.from('cognitive_scores').upsert(
      { user_id: userId, ability, score },
      { onConflict: 'user_id,ability' }
    );
    if (error) console.error('Failed to save cognitive score', error);
  }

  async function handleFinish(score: number) {
    const ability = COGNITIVE_ABILITIES[index];
    setScores((s) => ({ ...s, [ability]: score }));
    await saveScore(ability, score);
    const next = index + 1;
    if (next >= TOTAL) {
      await onComplete();
    } else {
      setIndex(next);
      await onStepChange?.(next);
    }
  }

  const props: Omit<GameProps, 'onFinish'> = { theme: hobbies, favoriteSubject };
  const gameProps = { ...props, onFinish: handleFinish, index, total: TOTAL };

  switch (index) {
    case 0:
      return <MemoryGame {...gameProps} />;
    case 1:
      return <AttentionGame {...gameProps} />;
    case 2:
      return <ActiveRecallGame {...gameProps} />;
    case 3:
      return <ProcessingSpeedGame {...gameProps} />;
    case 4:
      return <FocusGame {...gameProps} />;
    case 5:
      return <PatternRecognitionGame {...gameProps} />;
    case 6:
      return <LogicalReasoningGame {...gameProps} />;
    case 7:
      return <ReactionTimeGame {...gameProps} />;
    default:
      return null;
  }
}
