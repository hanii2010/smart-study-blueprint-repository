/*
# Phase 2 — Chat dashboard tables

1. Overview
   This migration creates the tables that back the Phase 2 chat dashboard:
   - `chat_conversations`: one row per chat session (sidebar history)
   - `chat_messages`: individual messages within a conversation
   - `documents`: uploaded PDF metadata + extracted text content
   - `quiz_scores`: quiz attempt results linked to user, subject/document, and timestamp

2. New Tables

   chat_conversations
     - id (uuid, primary key)
     - user_id (uuid, references auth.users, cascading delete, defaults to auth.uid())
     - title (text) — auto-generated from first message or user-set
     - created_at (timestamptz)
     - updated_at (timestamptz) — bumped on new message

   chat_messages
     - id (uuid, primary key)
     - conversation_id (uuid, references chat_conversations, cascading delete)
     - user_id (uuid, references auth.users, cascading delete, defaults to auth.uid())
     - role (text) — 'user' | 'assistant'
     - content (text) — message text
     - metadata (jsonb) — optional structured data (e.g. quiz payload, document reference)
     - created_at (timestamptz)

   documents
     - id (uuid, primary key)
     - user_id (uuid, references auth.users, cascading delete, defaults to auth.uid())
     - conversation_id (uuid, references chat_conversations, cascading delete, nullable)
     - filename (text)
     - page_count (integer)
     - text_content (text) — extracted text from the PDF
     - created_at (timestamptz)

   quiz_scores
     - id (uuid, primary key)
     - user_id (uuid, references auth.users, cascading delete, defaults to auth.uid())
     - conversation_id (uuid, references chat_conversations, nullable)
     - document_id (uuid, references documents, nullable)
     - subject (text, nullable)
     - score (integer) — number of correct answers
     - total_questions (integer) — total questions in the quiz
     - created_at (timestamptz)

3. Security
   - RLS enabled on all four tables.
   - Owner-scoped CRUD (TO authenticated) using auth.uid() = user_id on each table.
   - user_id columns default to auth.uid() so client inserts that omit user_id succeed.
   - chat_messages ownership checked via direct user_id column (not parent join) for simplicity.

4. Notes
   - Idempotent via IF NOT EXISTS and DROP POLICY IF EXISTS.
   - No destructive operations on existing tables.
*/

CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text DEFAULT 'New Chat',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON chat_conversations;
CREATE POLICY "select_own_conversations" ON chat_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON chat_conversations;
CREATE POLICY "insert_own_conversations" ON chat_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_conversations" ON chat_conversations;
CREATE POLICY "update_own_conversations" ON chat_conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON chat_conversations;
CREATE POLICY "delete_own_conversations" ON chat_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON chat_messages;
CREATE POLICY "select_own_messages" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_messages" ON chat_messages;
CREATE POLICY "insert_own_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_messages" ON chat_messages;
CREATE POLICY "update_own_messages" ON chat_messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_messages" ON chat_messages;
CREATE POLICY "delete_own_messages" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE,
  filename text NOT NULL,
  page_count integer NOT NULL DEFAULT 0,
  text_content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS quiz_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  subject text,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_quiz_scores" ON quiz_scores;
CREATE POLICY "select_own_quiz_scores" ON quiz_scores FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_quiz_scores" ON quiz_scores;
CREATE POLICY "insert_own_quiz_scores" ON quiz_scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_quiz_scores" ON quiz_scores;
CREATE POLICY "update_own_quiz_scores" ON quiz_scores FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_quiz_scores" ON quiz_scores;
CREATE POLICY "delete_own_quiz_scores" ON quiz_scores FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_id ON quiz_scores(user_id);