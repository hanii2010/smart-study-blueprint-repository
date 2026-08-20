/*
# Smart Study Blueprint - initial schema

1. Overview
   This migration creates the tables that back the "Smart Study Blueprint"
   onboarding flow: a per-user `profiles` table storing the answers to the
   Stage A profile questionnaire (plus blueprint progress tracking), and a
   `cognitive_scores` table storing one score per cognitive ability from
   Stage B.

2. New Tables

   profiles
     - user_id (uuid, primary key, references auth.users, cascading delete)
     - name (text)
     - age (integer)
     - grade (text)  -- e.g. "Class 9", "Undergraduate"
     - subjects (text[])  -- multi-select subjects the user takes
     - favorite_subject (text)
     - strongest_subject (text)
     - weakest_subject (text)
     - last_year_percentage (integer)  -- 0-100
     - goal_percentage (integer)      -- 0-100
     - hobbies (text[])                -- multi-select hobbies
     - hobby_skills (text[])           -- skills related to selected hobbies
     - study_hours (text)              -- e.g. "1-2 hours"
     - blueprint_stage (text, default 'profile')  -- 'profile' | 'cognitive' | 'done'
     - profile_step (integer, default 0)          -- current profile question index (0-11)
     - cognitive_step (integer, default 0)         -- current game index (0-7)
     - created_at (timestamptz)
     - updated_at (timestamptz)

   cognitive_scores
     - id (uuid, primary key)
     - user_id (uuid, references auth.users, cascading delete)
     - ability (text)  -- 'memory' | 'attention' | 'active_recall' | ... | 'reaction_time'
     - score (numeric) -- raw score for the ability (game-specific units)
     - created_at (timestamptz)
     - Unique constraint on (user_id, ability) so each ability has one row per user.

3. Security
   - RLS enabled on both tables.
   - Owner-scoped CRUD policies (TO authenticated) using auth.uid() = user_id.
   - user_id columns default to auth.uid() so client inserts that omit user_id succeed.

4. Notes
   - Email confirmation stays OFF (default).
   - No destructive operations; safe to re-run (idempotent via IF NOT EXISTS and DROP POLICY IF EXISTS).
*/

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  age integer,
  grade text,
  subjects text[] DEFAULT '{}',
  favorite_subject text,
  strongest_subject text,
  weakest_subject text,
  last_year_percentage integer,
  goal_percentage integer,
  hobbies text[] DEFAULT '{}',
  hobby_skills text[] DEFAULT '{}',
  study_hours text,
  blueprint_stage text NOT NULL DEFAULT 'profile',
  profile_step integer NOT NULL DEFAULT 0,
  cognitive_step integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cognitive_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  ability text NOT NULL,
  score numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ability)
);

ALTER TABLE cognitive_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cognitive_scores" ON cognitive_scores;
CREATE POLICY "select_own_cognitive_scores" ON cognitive_scores FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cognitive_scores" ON cognitive_scores;
CREATE POLICY "insert_own_cognitive_scores" ON cognitive_scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cognitive_scores" ON cognitive_scores;
CREATE POLICY "update_own_cognitive_scores" ON cognitive_scores FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cognitive_scores" ON cognitive_scores;
CREATE POLICY "delete_own_cognitive_scores" ON cognitive_scores FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
