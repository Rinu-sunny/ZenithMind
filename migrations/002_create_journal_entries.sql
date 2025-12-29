-- Migration: 002_create_journal_entries.sql
-- Creates the journal_entries table used by the app

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  date timestamptz DEFAULT now(),
  emotion text,
  sentiment numeric,
  prompt text,
  raw jsonb
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries (user_id, date);
