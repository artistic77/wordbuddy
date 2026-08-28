-- ==============================================================================
-- Word Buddy — Favorite Vocab Sets Migration
-- Migration: 20260828000000_add_favorite_vocab_sets.sql
-- ==============================================================================

-- 1. Create favorite_vocab_sets table
CREATE TABLE IF NOT EXISTS public.favorite_vocab_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES public.vocab_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_user_vocab_set_favorite UNIQUE (user_id, set_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorite_vocab_sets_user_id ON public.favorite_vocab_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_vocab_sets_set_id ON public.favorite_vocab_sets(set_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.favorite_vocab_sets ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view own favorite sets"
    ON public.favorite_vocab_sets FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can add favorites"
    ON public.favorite_vocab_sets FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.vocab_sets
            WHERE public.vocab_sets.id = set_id
            AND (public.vocab_sets.is_public = true OR public.vocab_sets.owner_id = auth.uid())
        )
    );

CREATE POLICY "Users can remove own favorites"
    ON public.favorite_vocab_sets FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());
