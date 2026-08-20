import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type BlueprintStage = 'profile' | 'cognitive' | 'done';

export interface Profile {
  user_id: string;
  name: string | null;
  age: number | null;
  grade: string | null;
  subjects: string[];
  favorite_subject: string | null;
  strongest_subject: string | null;
  weakest_subject: string | null;
  last_year_percentage: number | null;
  goal_percentage: number | null;
  hobbies: string[];
  hobby_skills: string[];
  study_hours: string | null;
  blueprint_stage: BlueprintStage;
  profile_step: number;
  cognitive_step: number;
  created_at?: string;
  updated_at?: string;
}

export interface CognitiveScore {
  id?: string;
  user_id: string;
  ability: string;
  score: number;
  created_at?: string;
}

export interface CognitiveScoreLite {
  ability: string;
  score: number;
}

export const COGNITIVE_ABILITIES = [
  'memory',
  'attention',
  'active_recall',
  'processing_speed',
  'focus',
  'pattern_recognition',
  'logical_reasoning',
  'reaction_time',
] as const;

export type CognitiveAbility = (typeof COGNITIVE_ABILITIES)[number];

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  user_id: string;
  conversation_id: string | null;
  filename: string;
  page_count: number;
  text_content: string;
  created_at: string;
}

export interface QuizScoreRow {
  id: string;
  user_id: string;
  conversation_id: string | null;
  document_id: string | null;
  subject: string | null;
  score: number;
  total_questions: number;
  created_at: string;
}
