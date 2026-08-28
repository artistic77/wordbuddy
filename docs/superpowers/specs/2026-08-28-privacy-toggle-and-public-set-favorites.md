# Specification & Requirement Log: Vocab Set Privacy & Public Set Favorites

**Date**: 2026-08-28  
**Status**: Completed & Deployed to Production (`main` / `develop`)

---

## 1. Requirements Overview

1. **Vocab Set Privacy Editing (Private <-> Public)**:
   - Allow vocab set owners to toggle privacy of their sets between **Private** and **Public**.
   - Accessible via the Set Detail Page header pill badge (interactive toggle with confirmation dialog) and via a quick toggle button on each set card in "My Vocab Sets".
2. **Public Vocab Set Favoriting**:
   - Allow learners to favorite public vocabulary sets created by others without having to clone them first.
   - Favorite button (⭐ Star icon) available on public sets in `ExplorePage.tsx` and `SetDetailPage.tsx`.
   - Favorited public sets can be studied directly in all 5 interactive modes (Flashcards, Spelling, Quiz, Matching, Fill Blank).
3. **Favorites Tab in My Vocab Sets**:
   - In `SetsListPage.tsx` (`/sets`), provide dedicated tab switcher:
     - 📁 **My Sets**: User's owned decks with quick privacy toggle and word count.
     - ⭐ **Favorites**: All public decks favorited by the user, showing creator badge (`by Author`), word count, direct "Study" action, "Copy to My Sets" option, and 1-click unfavorite.
   - Search and sort seamlessly support both tabs.

---

## 2. Technical Architecture & Database

### Database Schema (`favorite_vocab_sets`)
- **Table**: `public.favorite_vocab_sets`
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
  - `set_id UUID NOT NULL REFERENCES public.vocab_sets(id) ON DELETE CASCADE`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())`
  - `UNIQUE(user_id, set_id)`
- **RLS Policies**:
  - `SELECT`: `auth.uid() = user_id OR public.is_admin()`
  - `INSERT`: `auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.vocab_sets WHERE id = set_id AND (is_public = true OR owner_id = auth.uid()))`
  - `DELETE`: `auth.uid() = user_id OR public.is_admin()`

### Service Layer (`src/services/favoriteService.ts`)
- `getUserFavoriteSetIds(userId: string)`: Returns `Set<string>` of favorited IDs.
- `toggleFavoriteSet(userId: string, setId: string, currentlyFavorited: boolean)`: Toggles favorite state.
- `getUserFavoriteSets(userId: string)`: Returns favorited sets enriched with creator display names and word counts.
