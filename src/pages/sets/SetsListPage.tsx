import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, BookOpen, Play, Trash2, Globe, Lock, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { CreateSetModal } from '../../components/vocab/CreateSetModal';
import type { VocabSet } from '../../types';

interface SetWithCount extends VocabSet {
  wordCount?: number;
}

export const SetsListPage: React.FC = () => {
  const { user } = useAuth();
  const [sets, setSets] = useState<SetWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical' | 'count'>('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
        .select('set_id');

      if (entriesErr) throw entriesErr;

      const countMap: Record<string, number> = {};
      (entriesData || []).forEach((entry) => {
        countMap[entry.set_id] = (countMap[entry.set_id] || 0) + 1;
      });

      const enriched = (setsData || []).map((s) => ({
        ...s,
        wordCount: countMap[s.id] || 0,
      }));

      setSets(enriched);
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

  // Filter and sort
  const filteredSets = useMemo(() => {
    return sets
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
  }, [sets, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-outfit font-bold text-text-primary tracking-tight">
              My Vocab Sets
            </h1>
            <Badge variant="default" size="sm">
              {sets.length} {sets.length === 1 ? 'set' : 'sets'}
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Organize, study, and master your English vocabulary decks.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Set
        </Button>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search sets..."
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
      ) : filteredSets.length === 0 ? (
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
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {set.is_public ? (
                        <span className="p-1 text-primary" title="Public set">
                          <Globe className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1 text-text-secondary" title="Private set">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 min-h-[32px] mb-4">
                    {set.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
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
