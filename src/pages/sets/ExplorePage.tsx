import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Globe, BookOpen, Copy, Check, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import type { VocabSet } from '../../types';

interface PublicSetWithAuthor extends VocabSet {
  authorName?: string;
  wordCount?: number;
}

export const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [publicSets, setPublicSets] = useState<PublicSetWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSetId, setCopiedSetId] = useState<string | null>(null);

  const fetchPublicSets = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch public sets
      const { data: setsData, error: setsErr } = await supabase
        .from('vocab_sets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (setsErr) throw setsErr;

      // 2. Fetch profiles for author names
      const { data: profilesData } = await supabase.from('profiles').select('id, display_name');
      const authorMap: Record<string, string> = {};
      (profilesData || []).forEach((p) => {
        authorMap[p.id] = p.display_name;
      });

      // 3. Fetch entry counts
      const { data: entriesData } = await supabase.from('vocab_entries').select('set_id');
      const countMap: Record<string, number> = {};
      (entriesData || []).forEach((e) => {
        countMap[e.set_id] = (countMap[e.set_id] || 0) + 1;
      });

      const enriched = (setsData || []).map((s) => ({
        ...s,
        authorName: authorMap[s.owner_id] || 'Word Buddy Learner',
        wordCount: countMap[s.id] || 0,
      }));

      setPublicSets(enriched);
    } catch (err) {
      console.error('Error fetching public sets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSets();
  }, []);

  const handleCopySet = async (targetSet: PublicSetWithAuthor, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      // 1. Create a new copy of the set owned by current user
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

      // 2. Fetch all entries from original set
      const { data: originalEntries } = await supabase
        .from('vocab_entries')
        .select('*')
        .eq('set_id', targetSet.id);

      // 3. Copy entries to the new set
      if (originalEntries && originalEntries.length > 0) {
        const clonedEntries = originalEntries.map((entry) => ({
          set_id: newSet.id,
          owner_id: user.id,
          word_en: entry.word_en,
          word_th: entry.word_th,
          part_of_speech: entry.part_of_speech,
          example_sentence_en: entry.example_sentence_en,
          example_sentence_th: entry.example_sentence_th,
        }));

        await supabase.from('vocab_entries').insert(clonedEntries);
      }

      setCopiedSetId(targetSet.id);
      setTimeout(() => setCopiedSetId(null), 2500);
    } catch (err) {
      console.error('Failed to copy set:', err);
    }
  };

  const filteredSets = publicSets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Globe className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-outfit font-bold text-text-primary tracking-tight">
            Explore Community Decks
          </h1>
        </div>
        <p className="text-text-secondary">
          Discover public vocabulary sets shared by other students and copy them directly to your personal collection.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search public sets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-card bg-surface animate-pulse border border-border" />
          ))}
        </div>
      ) : filteredSets.length === 0 ? (
        <Card className="py-16 text-center space-y-3 border-dashed border-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-light flex items-center justify-center text-primary">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-outfit font-bold text-text-primary">
            {searchQuery ? 'No public sets match your search' : 'No public decks shared yet'}
          </h3>
          <p className="text-xs text-text-secondary">
            Make any of your personal sets public in the settings to share with the community!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <Link key={set.id} to={`/sets/${set.id}`} className="block group">
              <Card hoverEffect className="h-full flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-outfit font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                      {set.title}
                    </h3>
                    <Badge variant="adj" size="sm">
                      <Globe className="w-3 h-3 mr-1" /> Public
                    </Badge>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 min-h-[32px] mb-4">
                    {set.description || 'Community vocabulary set.'}
                  </p>

                  <p className="text-xs text-text-muted">
                    Created by: <span className="font-medium text-text-secondary">{set.authorName}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between mt-4">
                  <Badge variant="noun" size="sm">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {set.wordCount || 0} words
                  </Badge>

                  <Button
                    type="button"
                    variant={copiedSetId === set.id ? 'success' : 'secondary'}
                    size="sm"
                    onClick={(e) => handleCopySet(set, e)}
                    className="h-8 px-3 text-xs"
                  >
                    {copiedSetId === set.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy to Mine
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
