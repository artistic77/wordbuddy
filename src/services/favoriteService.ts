import { supabase } from '../lib/supabase';
import type { VocabSet } from '../types';

export interface FavoriteSetItem extends VocabSet {
  authorName?: string;
  wordCount?: number;
  favoritedAt?: string;
}

export const favoriteService = {
  /**
   * Fetch all set IDs favorited by a user
   */
  async getUserFavoriteSetIds(userId: string): Promise<Set<string>> {
    try {
      const { data, error } = await supabase
        .from('favorite_vocab_sets')
        .select('set_id')
        .eq('user_id', userId);

      if (error) throw error;
      return new Set((data || []).map((row) => row.set_id));
    } catch (err) {
      console.error('Error fetching favorite set IDs:', err);
      return new Set();
    }
  },

  /**
   * Toggle favorite status of a vocab set for a user
   * @returns true if favorited, false if unfavorited
   */
  async toggleFavoriteSet(userId: string, setId: string, currentlyFavorited: boolean): Promise<boolean> {
    if (currentlyFavorited) {
      const { error } = await supabase
        .from('favorite_vocab_sets')
        .delete()
        .eq('user_id', userId)
        .eq('set_id', setId);

      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('favorite_vocab_sets')
        .insert({
          user_id: userId,
          set_id: setId,
        });

      if (error) throw error;
      return true;
    }
  },

  /**
   * Fetch complete list of favorite vocab sets for a user with word counts and author names
   */
  async getUserFavoriteSets(userId: string): Promise<FavoriteSetItem[]> {
    try {
      // 1. Fetch favorite records for user
      const { data: favData, error: favErr } = await supabase
        .from('favorite_vocab_sets')
        .select('set_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (favErr) throw favErr;
      if (!favData || favData.length === 0) return [];

      const setIds = favData.map((f) => f.set_id);
      const favMap = new Map(favData.map((f) => [f.set_id, f.created_at]));

      // 2. Fetch the corresponding vocab sets (visible to user: either public or owned)
      const { data: setsData, error: setsErr } = await supabase
        .from('vocab_sets')
        .select('*')
        .in('id', setIds);

      if (setsErr) throw setsErr;
      if (!setsData || setsData.length === 0) return [];

      // 3. Fetch author profiles
      const ownerIds = Array.from(new Set(setsData.map((s) => s.owner_id)));
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ownerIds);

      const authorMap: Record<string, string> = {};
      (profilesData || []).forEach((p) => {
        authorMap[p.id] = p.display_name;
      });

      // 4. Fetch entry counts
      const { data: entriesData } = await supabase
        .from('vocab_entries')
        .select('set_id')
        .in('set_id', setIds);

      const countMap: Record<string, number> = {};
      (entriesData || []).forEach((e) => {
        countMap[e.set_id] = (countMap[e.set_id] || 0) + 1;
      });

      // 5. Combine and sort by favorited time
      const result: FavoriteSetItem[] = setsData.map((s) => ({
        ...s,
        authorName: authorMap[s.owner_id] || 'Word Buddy Learner',
        wordCount: countMap[s.id] || 0,
        favoritedAt: favMap.get(s.id),
      }));

      result.sort((a, b) => {
        const timeA = a.favoritedAt ? new Date(a.favoritedAt).getTime() : 0;
        const timeB = b.favoritedAt ? new Date(b.favoritedAt).getTime() : 0;
        return timeB - timeA;
      });

      return result;
    } catch (err) {
      console.error('Error fetching favorite sets:', err);
      return [];
    }
  },
};
