import { supabase } from '@/lib/supabase';
import type { Profile, CognitiveScoreLite } from '@/lib/supabase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface GeminiChatResponse {
  text: string;
}

export interface GeminiQuizResponse {
  questions: QuizQuestion[];
}

function getFunctionUrl() {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchCognitiveScores(userId: string): Promise<CognitiveScoreLite[]> {
  const { data, error } = await supabase
    .from('cognitive_scores')
    .select('ability, score')
    .eq('user_id', userId);
  if (error) return [];
  return (data as CognitiveScoreLite[]) ?? [];
}

export async function sendChatMessage(
  messages: ChatMessage[],
  profile: Profile,
  cognitiveScores: CognitiveScoreLite[],
  documentText?: string
): Promise<string> {
  const response = await fetch(getFunctionUrl(), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      messages,
      profile,
      cognitiveScores,
      documentText,
      mode: 'chat',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  const data: GeminiChatResponse = await response.json();
  return data.text;
}

export async function generateQuiz(
  profile: Profile,
  cognitiveScores: CognitiveScoreLite[],
  documentText?: string
): Promise<QuizQuestion[]> {
  const response = await fetch(getFunctionUrl(), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      messages: [],
      profile,
      cognitiveScores,
      documentText,
      mode: 'quiz',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  const data: GeminiQuizResponse = await response.json();
  return data.questions;
}
