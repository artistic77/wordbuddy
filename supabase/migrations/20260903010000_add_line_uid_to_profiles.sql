-- ==============================================================================
-- Word Buddy — Add LINE User ID & Profile Fields
-- Migration: 20260903010000_add_line_uid_to_profiles.sql
-- ==============================================================================

-- 1. Add LINE specific columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS line_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS line_display_name TEXT,
ADD COLUMN IF NOT EXISTS line_picture_url TEXT;

-- 2. Index for fast lookup by line_user_id for broadcasts and login
CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id 
ON public.profiles(line_user_id);
