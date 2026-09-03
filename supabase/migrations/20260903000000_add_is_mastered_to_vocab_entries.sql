-- ==============================================================================
-- Word Buddy — Add is_mastered Flag to vocab_entries
-- Migration: 20260903000000_add_is_mastered_to_vocab_entries.sql
-- ==============================================================================

-- 1. Add is_mastered column with default false
ALTER TABLE public.vocab_entries 
ADD COLUMN IF NOT EXISTS is_mastered BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Index for filtering performance
CREATE INDEX IF NOT EXISTS idx_vocab_entries_is_mastered 
ON public.vocab_entries(set_id, is_mastered);
