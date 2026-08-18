import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Trash2, Globe, Lock, Volume2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { speakWord } from '../../services/ttsService';
import type { Profile, VocabSet, VocabEntry } from '../../types';

interface SetWithEntries extends VocabSet {
  entries: VocabEntry[];
}

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [setsWithEntries, setSetsWithEntries] = useState<SetWithEntries[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      setProfile(profileData);

      // 2. Fetch sets
      const { data: setsData } = await supabase
        .from('vocab_sets')
        .select('*')
        .eq('owner_id', id)
        .order('created_at', { ascending: false });

      // 3. Fetch entries for all sets
      const { data: entriesData } = await supabase
        .from('vocab_entries')
        .select('*')
        .eq('owner_id', id);

      const entryMap: Record<string, VocabEntry[]> = {};
      (entriesData || []).forEach((entry) => {
        if (!entryMap[entry.set_id]) entryMap[entry.set_id] = [];
        entryMap[entry.set_id].push(entry);
      });

      const enrichedSets = (setsData || []).map((s) => ({
        ...s,
        entries: entryMap[s.id] || [],
      }));

      setSetsWithEntries(enrichedSets);
    } catch (err) {
      console.error('Error fetching admin user detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const handleDeleteSet = async (setId: string) => {
    if (!window.confirm('Admin Action: Delete this user set and all words?')) return;
    try {
      await supabase.from('vocab_sets').delete().eq('id', setId);
      setSetsWithEntries((prev) => prev.filter((s) => s.id !== setId));
    } catch (err) {
      console.error('Failed to delete set:', err);
    }
  };

  const handleDeleteEntry = async (entryId: string, setId: string) => {
    if (!window.confirm('Admin Action: Delete this word?')) return;
    try {
      await supabase.from('vocab_entries').delete().eq('id', entryId);
      setSetsWithEntries((prev) =>
        prev.map((s) =>
          s.id === setId ? { ...s, entries: s.entries.filter((e) => e.id !== entryId) } : s
        )
      );
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary">Loading user records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Directory
      </Link>

      {/* User Header */}
      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary font-outfit font-bold text-2xl flex items-center justify-center">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-outfit font-bold text-text-primary">
                {profile.display_name}
              </h1>
              <Badge variant={profile.role === 'admin' ? 'admin' : 'user'} size="sm">
                {profile.role}
              </Badge>
              {profile.is_suspended && (
                <Badge variant="suspended" size="sm">
                  Suspended
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-secondary font-mono mt-1">User ID: {profile.id}</p>
          </div>
        </div>
      </Card>

      {/* User's Vocab Sets Accordion */}
      <div className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-text-primary">
          User Vocabulary Decks ({setsWithEntries.length})
        </h2>

        {setsWithEntries.length === 0 ? (
          <Card className="py-12 text-center text-text-secondary">
            This user has not created any vocabulary sets yet.
          </Card>
        ) : (
          <div className="space-y-4">
            {setsWithEntries.map((set) => (
              <Card key={set.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-outfit font-bold text-text-primary">{set.title}</h3>
                    <Badge variant="noun" size="sm">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {set.entries.length} words
                    </Badge>
                    {set.is_public ? (
                      <Badge variant="adj" size="sm">
                        <Globe className="w-3 h-3 mr-1" /> Public
                      </Badge>
                    ) : (
                      <Badge variant="other" size="sm">
                        <Lock className="w-3 h-3 mr-1" /> Private
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteSet(set.id)}
                    className="h-8 px-2.5 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete Set
                  </Button>
                </div>

                {set.entries.length > 0 && (
                  <div className="overflow-x-auto border border-border rounded-xl mt-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface border-b border-border font-semibold text-text-secondary uppercase">
                        <tr>
                          <th className="px-4 py-2.5">Word (EN)</th>
                          <th className="px-4 py-2.5">Translation (TH)</th>
                          <th className="px-4 py-2.5">POS</th>
                          <th className="px-4 py-2.5">Example Sentence</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {set.entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-surface/50">
                            <td className="px-4 py-2.5 font-bold text-primary">
                              <div className="flex items-center gap-1.5">
                                <span>{entry.word_en}</span>
                                <button
                                  type="button"
                                  onClick={() => speakWord(entry.word_en)}
                                  className="text-text-secondary hover:text-primary"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 font-sarabun font-medium">{entry.word_th}</td>
                            <td className="px-4 py-2.5">
                              <Badge pos={entry.part_of_speech} size="sm">
                                {entry.part_of_speech}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-text-secondary truncate max-w-xs">
                              {entry.example_sentence_en || '—'}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(entry.id, set.id)}
                                className="text-secondary hover:text-red-700 p-1"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
