-- ==============================================================================
-- Word Buddy — Initial Database Schema & Row Level Security (RLS) Policies
-- Migration: 20260817000000_initial_schema.sql
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Word Buddy Learner',
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Vocab Sets table
CREATE TABLE IF NOT EXISTS public.vocab_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Vocab Entries table
CREATE TABLE IF NOT EXISTS public.vocab_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID NOT NULL REFERENCES public.vocab_sets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    word_en TEXT NOT NULL,
    word_th TEXT NOT NULL,
    part_of_speech TEXT NOT NULL DEFAULT 'noun' CHECK (part_of_speech IN ('noun', 'verb', 'adj', 'adv', 'other', 'gerund', 'past_participle')),
    example_sentence_en TEXT,
    example_sentence_th TEXT,
    image_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Study Sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES public.vocab_sets(id) ON DELETE CASCADE,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('flashcard', 'spelling', 'multiple_choice', 'matching', 'fill_blank')),
    score INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_vocab_sets_owner_id ON public.vocab_sets(owner_id);
CREATE INDEX IF NOT EXISTS idx_vocab_sets_is_public ON public.vocab_sets(is_public);
CREATE INDEX IF NOT EXISTS idx_vocab_entries_set_id ON public.vocab_entries(set_id);
CREATE INDEX IF NOT EXISTS idx_vocab_entries_owner_id ON public.vocab_entries(owner_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_set_id ON public.study_sessions(set_id);

-- ==============================================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_vocab_sets_updated_at
    BEFORE UPDATE ON public.vocab_sets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_vocab_entries_updated_at
    BEFORE UPDATE ON public.vocab_entries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Word Buddy Learner'),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to hook auth.users signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- HELPER FUNCTIONS FOR SECURITY & RLS
-- ==============================================================================

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        -- Regular users cannot promote themselves to admin or change is_suspended
        auth.uid() = id AND (
            public.is_admin() OR (
                role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
                is_suspended = (SELECT is_suspended FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY "Admins have full update access to profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- VOCAB SETS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own sets or public sets"
    ON public.vocab_sets FOR SELECT
    USING (auth.uid() = owner_id OR is_public = true OR public.is_admin());

CREATE POLICY "Users can insert own sets"
    ON public.vocab_sets FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own sets"
    ON public.vocab_sets FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Users can delete own sets"
    ON public.vocab_sets FOR DELETE
    USING (auth.uid() = owner_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- VOCAB ENTRIES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view entries of visible sets"
    ON public.vocab_entries FOR SELECT
    USING (
        auth.uid() = owner_id OR 
        EXISTS (
            SELECT 1 FROM public.vocab_sets
            WHERE public.vocab_sets.id = public.vocab_entries.set_id
            AND (public.vocab_sets.is_public = true OR public.vocab_sets.owner_id = auth.uid())
        ) OR 
        public.is_admin()
    );

CREATE POLICY "Users can insert entries into own sets"
    ON public.vocab_entries FOR INSERT
    WITH CHECK (
        auth.uid() = owner_id AND
        EXISTS (
            SELECT 1 FROM public.vocab_sets
            WHERE public.vocab_sets.id = public.vocab_entries.set_id
            AND public.vocab_sets.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own entries"
    ON public.vocab_entries FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Users can delete own entries"
    ON public.vocab_entries FOR DELETE
    USING (auth.uid() = owner_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- STUDY SESSIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own study sessions"
    ON public.study_sessions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own study sessions"
    ON public.study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
