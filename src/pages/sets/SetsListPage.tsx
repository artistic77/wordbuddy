import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Play,
  Trash2,
  Globe,
  Lock,
  SlidersHorizontal,
  Star,
  Compass,
  Copy,
  Check,
  User as UserIcon,
  FolderHeart,
  FolderRoot,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { favoriteService, type FavoriteSetItem } from '../../services/favoriteService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { CreateSetModal } from '../../components/vocab/CreateSetModal';
import type { VocabSet } from '../../types';

interface SetWithCount extends VocabSet {
  wordCount?: number;
  masteredCount?: number;
}

export const SetsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'my-sets' | 'favorites'>('my-sets');
  const [sets, setSets] = useState<SetWithCount[]>([]);
  const [favoriteSets, setFavoriteSets] = useState<FavoriteSetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical' | 'count'>('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [togglingPrivacyId, setTogglingPrivacyId] = useState<string | null>(null);
  const [copiedSetId, setCopiedSetId] = useState<string | null>(null);

  const fetchSets = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch user sets
      const { data: setsData, error: setsErr } = await supabase
        .from('vocab_sets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (setsErr) throw setsErr;

      // 2. Fetch entry counts per set
      const { data: entriesData, error: entriesErr } = await supabase
        .from('vocab_entries')
        .select('set_id, is_mastered');

      if (entriesErr) throw entriesErr;

      const countMap: Record<string, { total: number; mastered: number }> = {};
      (entriesData || []).forEach((entry) => {
        if (!countMap[entry.set_id]) {
          countMap[entry.set_id] = { total: 0, mastered: 0 };
        }
        countMap[entry.set_id].total += 1;
        if (entry.is_mastered) {
          countMap[entry.set_id].mastered += 1;
        }
      });

      const enriched = (setsData || []).map((s) => ({
        ...s,
        wordCount: countMap[s.id]?.total || 0,
        masteredCount: countMap[s.id]?.mastered || 0,
      }));

      setSets(enriched);

      // 3. Fetch favorite sets
      const favs = await favoriteService.getUserFavoriteSets(user.id);
      setFavoriteSets(favs);
    } catch (err) {
      console.error('Error fetching sets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [user]);

  const handleCreateSet = async (title: string, description: string, isPublic: boolean) => {
    if (!user) return;
    const { error } = await supabase.from('vocab_sets').insert({
      owner_id: user.id,
      title,
      description,
      is_public: isPublic,
    });
    if (error) throw error;
    await fetchSets();
  };

  const handleDeleteSet = async (setId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this vocabulary set and all its words?')) {
      return;
    }

    try {
      const { error } = await supabase.from('vocab_sets').delete().eq('id', setId);
      if (error) throw error;
      setSets((prev) => prev.filter((s) => s.id !== setId));
    } catch (err) {
      console.error('Error deleting set:', err);
    }
  };

  const handleTogglePrivacy = async (set: SetWithCount, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newPrivacy = !set.is_public;
    const confirmMsg = newPrivacy
      ? `Make "${set.title}" Public? Anyone will be able to discover, favorite, and study it.`
      : `Make "${set.title}" Private? Only you will be able to view and study it.`;

    if (!window.confirm(confirmMsg)) return;

    setTogglingPrivacyId(set.id);
    try {
      const { error } = await supabase
        .from('vocab_sets')
        .update({ is_public: newPrivacy })
        .eq('id', set.id);

      if (error) throw error;
      setSets((prev) =>
        prev.map((s) => (s.id === set.id ? { ...s, is_public: newPrivacy } : s))
      );
    } catch (err) {
      console.error('Error updating privacy:', err);
      alert('Failed to change privacy.');
    } finally {
      setTogglingPrivacyId(null);
    }
  };

  const handleUnfavorite = async (setId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) return;

    try {
      await favoriteService.toggleFavoriteSet(user.id, setId, true);
      setFavoriteSets((prev) => prev.filter((s) => s.id !== setId));
    } catch (err) {
      console.error('Error unfavoriting set:', err);
    }
  };

  const handleCopySet = async (targetSet: FavoriteSetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      // 1. Create set copy
      const { data: newSet, error: setErr } = await supabase
        .from('vocab_sets')
        .insert({
          owner_id: user.id,
          title: `${targetSet.title} (Copy)`,
          description: targetSet.description,
          is_public: false,
        })
        .select()
        .single();

      if (setErr || !newSet) throw setErr;

      // 2. Fetch original entries
      const { data: originalEntries } = await supabase
        .from('vocab_entries')
        .select('*')
        .eq('set_id', targetSet.id);

      if (originalEntries && originalEntries.length > 0) {
        const cloned = originalEntries.map((entry) => ({
          set_id: newSet.id,
          owner_id: user.id,
          word_en: entry.word_en,
          word_th: entry.word_th,
          audio_url: entry.audio_url,
          part_of_speech: entry.part_of_speech,
          example_sentence_en: entry.example_sentence_en,
          example_sentence_th: entry.example_sentence_th,
        }));
        await supabase.from('vocab_entries').insert(cloned);
      }

      setCopiedSetId(targetSet.id);
      setTimeout(() => setCopiedSetId(null), 2000);
      await fetchSets();
    } catch (err) {
      console.error('Error copying set:', err);
      alert('Failed to copy set.');
    }
  };

  // Filter and sort for active tab
  const currentList = activeTab === 'my-sets' ? sets : favoriteSets;

  const filteredSets = useMemo(() => {
    return currentList
      .filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'count') {
          return (b.wordCount || 0) - (a.wordCount || 0);
        }
        return 0;
      });
  }, [currentList, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-outfit font-bold text-text-primary tracking-tight">
              My Vocab Sets
            </h1>
            <Badge variant="default" size="sm">
              {sets.length} created
            </Badge>
            {favoriteSets.length > 0 && (
              <Badge variant="noun" size="sm" className="bg-amber-50 text-amber-700 border-amber-200">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-500" />
                {favoriteSets.length} favorite{favoriteSets.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-text-secondary mt-1">
            Organize, study, and master your English vocabulary decks.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)} className="flex-1 sm:flex-initial">
            <Plus className="w-4 h-4 mr-1.5" />
            New Set
          </Button>
        </div>
      </div>

      {/* Tabs Switcher: My Sets vs Favorites */}
      <div className="flex items-center justify-between border-b border-border pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('my-sets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'my-sets'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <FolderRoot className="w-4 h-4" />
            <span>My Sets</span>
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'my-sets' ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-secondary'
              }`}
            >
              {sets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-white' : 'text-amber-500 fill-amber-400'}`} />
            <span>Favorites</span>
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-secondary'
              }`}
            >
              {favoriteSets.length}
            </span>
          </button>
        </div>

        {activeTab === 'favorites' && (
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Compass className="w-4 h-4" />
            <span>Find more in Explore</span>
          </Link>
        )}
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder={activeTab === 'my-sets' ? 'Search my sets...' : 'Search favorite sets...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'alphabetical' | 'count')}
            className="h-11 px-3.5 rounded-input bg-white border border-border text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">Sort by Newest</option>
            <option value="alphabetical">Sort A – Z</option>
            <option value="count">Most Words</option>
          </select>
        </div>
      </div>

      {/* Sets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-card bg-surface animate-pulse border border-border" />
          ))}
        </div>
      ) : activeTab === 'my-sets' ? (
        // ==================== MY SETS TAB ====================
        filteredSets.length === 0 ? (
          <Card className="py-16 text-center space-y-4 border-dashed border-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-light/50 flex items-center justify-center p-3">
              <img src="/owl-icon.svg" alt="Mascot" className="w-14 h-14" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-outfit font-bold text-text-primary">
                {searchQuery ? 'No sets match your search' : 'No vocabulary sets yet!'}
              </h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                {searchQuery
                  ? 'Try a different search query or clear the filter.'
                  : 'Create your first vocabulary deck to start adding words and practicing games.'}
              </p>
            </div>
            {!searchQuery && (
              <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Set
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Add Card */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-full min-h-[200px] border-2 border-dashed border-primary/30 rounded-card hover:border-primary bg-primary-light/10 hover:bg-primary-light/20 transition-all flex flex-col items-center justify-center gap-3 p-6 text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="font-outfit font-bold text-base text-primary">+ Add New Set</p>
                <p className="text-xs text-text-secondary mt-0.5">Quickly start a new deck</p>
              </div>
            </button>

            {/* User Set Cards */}
            {filteredSets.map((set) => (
              <Link key={set.id} to={`/sets/${set.id}`} className="block group">
                <Card hoverEffect className="h-full flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-outfit font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                        {set.title}
                      </h3>

                      {/* Interactive Quick Privacy Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleTogglePrivacy(set as SetWithCount, e)}
                        disabled={togglingPrivacyId === set.id}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all flex-shrink-0 cursor-pointer ${
                          set.is_public
                            ? 'bg-accent-teal-light text-accent-teal border-accent-teal/30 hover:bg-accent-teal/20'
                            : 'bg-gray-100 text-text-secondary border-gray-200 hover:bg-gray-200'
                        }`}
                        title={
                          set.is_public
                            ? 'Public set (Click to make Private)'
                            : 'Private set (Click to make Public)'
                        }
                      >
                        {set.is_public ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Private</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 min-h-[32px] mb-4">
                      {set.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Mastery Progress on card */}
                  {(set.wordCount || 0) > 0 && (
                    <div className="mb-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          จำได้แล้ว {(set as SetWithCount).masteredCount || 0}/{set.wordCount} คำ
                        </span>
                        <span className="text-text-muted">
                          {Math.round(
                            (((set as SetWithCount).masteredCount || 0) / (set.wordCount || 1)) * 100
                          )}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round(
                              (((set as SetWithCount).masteredCount || 0) / (set.wordCount || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <Badge variant="noun" size="sm">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {set.wordCount || 0} {set.wordCount === 1 ? 'word' : 'words'}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSet(set.id, e)}
                        className="p-2 rounded-xl text-text-secondary hover:text-secondary hover:bg-secondary-light transition-colors"
                        title="Delete set"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Button variant="primary" size="sm" className="h-8 px-3 text-xs">
                        <Play className="w-3 h-3 mr-1 fill-current" />
                        Study
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        // ==================== FAVORITES TAB ====================
        filteredSets.length === 0 ? (
          <Card className="py-16 text-center space-y-4 border-dashed border-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center p-3 text-amber-500">
              <FolderHeart className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-outfit font-bold text-text-primary">
                {searchQuery ? 'No favorites match your search' : 'No favorite sets yet!'}
              </h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                {searchQuery
                  ? 'Try a different search query or clear the filter.'
                  : 'Discover public decks created by other learners and add them to your favorites to practice anytime.'}
              </p>
            </div>
            {!searchQuery && (
              <Link to="/explore">
                <Button variant="primary" size="md">
                  <Compass className="w-4 h-4 mr-1.5" />
                  Explore Public Sets
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map((fSet) => {
              const fav = fSet as FavoriteSetItem;
              return (
                <Link key={fav.id} to={`/sets/${fav.id}`} className="block group">
                  <Card hoverEffect className="h-full flex flex-col justify-between p-6 border-amber-200/50 bg-gradient-to-b from-amber-50/20 to-white">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-outfit font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                          {fav.title}
                        </h3>

                        {/* Unfavorite Button */}
                        <button
                          type="button"
                          onClick={(e) => handleUnfavorite(fav.id, e)}
                          className="p-1.5 rounded-xl text-amber-500 hover:bg-amber-100/80 transition-colors flex-shrink-0"
                          title="Remove from favorites"
                        >
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        </button>
                      </div>

                      {/* Author badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center text-[11px] font-medium text-text-secondary bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                          <UserIcon className="w-3 h-3 mr-1 text-slate-500" />
                          {fav.authorName || 'Learner'}
                        </span>
                        {fav.is_public && (
                          <span className="inline-flex items-center text-[11px] font-medium text-accent-teal bg-accent-teal-light px-2 py-0.5 rounded-full">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-secondary line-clamp-2 min-h-[32px] mb-4">
                        {fav.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <Badge variant="noun" size="sm">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {fav.wordCount || 0} {fav.wordCount === 1 ? 'word' : 'words'}
                      </Badge>

                      <div className="flex items-center gap-2">
                        {/* Copy to own collection */}
                        <button
                          type="button"
                          onClick={(e) => handleCopySet(fav, e)}
                          className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors"
                          title="Copy to My Sets"
                        >
                          {copiedSetId === fav.id ? (
                            <Check className="w-4 h-4 text-accent-green" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <Button variant="primary" size="sm" className="h-8 px-3 text-xs">
                          <Play className="w-3 h-3 mr-1 fill-current" />
                          Study
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* Create Set Modal */}
      <CreateSetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSet}
      />
    </div>
  );
};
