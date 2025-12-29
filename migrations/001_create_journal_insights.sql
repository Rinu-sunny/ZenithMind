-- Migration: 001_create_journal_insights.sql
-- Creates a table to store AI-generated insights from user journal entries.

-- Use pgcrypto's gen_random_uuid() which Supabase enables by default.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.journal_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date timestamptz DEFAULT now(),
  dominant_emotion text,
  sentiment_score numeric,
  reflective_question text,
  suggested_action text,
  raw jsonb
);

-- Index to optimize queries by user and date
CREATE INDEX IF NOT EXISTS idx_journal_insights_user_date ON public.journal_insights (user_id, date);
