import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Volume2,
  Trash2,
  Globe,
  Lock,
  BookOpen,
  Sparkles,
  Layers,
  HelpCircle,
  Headphones,
  Edit2,
  Pencil,
  Check,
  Puzzle,
  PenTool,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AddVocabModal } from '../../components/vocab/AddVocabModal';
import { EditVocabModal } from '../../components/vocab/EditVocabModal';
import { speakWord } from '../../services/ttsService';
import { getThaiPhonetic } from '../../services/phoneticService';
import type { VocabSet, VocabEntry, PartOfSpeech } from '../../types';

export const SetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [set, setSet] = useState<VocabSet | null>(null);
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState<VocabEntry | null>(null);

  // Inline title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const fetchSetData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Fetch set details
      const { data: setData, error: setErr } = await supabase
        .from('vocab_sets')
        .select('*')
        .eq('id', id)
        .single();

      if (setErr) throw setErr;
      setSet(setData);
      setEditedTitle(setData.title);

      // 2. Fetch vocab entries
      const { data: entriesData, error: entriesErr } = await supabase
        .from('vocab_entries')
        .select('*')
        .eq('set_id', id)
        .order('created_at', { ascending: true });

      if (entriesErr) throw entriesErr;
      setEntries(entriesData || []);
    } catch (err) {
      console.error('Error fetching set:', err);
      navigate('/sets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSetData();
  }, [id]);

  const handleSaveTitle = async () => {
    if (!set || !editedTitle.trim()) return;
    try {
      const { error } = await supabase
        .from('vocab_sets')
        .update({ title: editedTitle.trim() })
        .eq('id', set.id);

      if (error) throw error;
      setSet((prev) => (prev ? { ...prev, title: editedTitle.trim() } : null));
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Error updating set title:', err);
    }
  };

  const handleAddWord = async (entry: {
    word_en: string;
    word_th: string;
    reading_th?: string;
    part_of_speech: PartOfSpeech;
    example_sentence_en: string;
    example_sentence_th: string;
  }) => {
    if (!set || !user) return;
    const { data, error } = await supabase
      .from('vocab_entries')
      .insert({
        set_id: set.id,
        owner_id: user.id,
        word_en: entry.word_en,
        word_th: entry.word_th,
        audio_url: entry.reading_th ? `reading_th:${entry.reading_th}` : null,
        part_of_speech: entry.part_of_speech,
        example_sentence_en: entry.example_sentence_en,
        example_sentence_th: entry.example_sentence_th,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setEntries((prev) => [...prev, data]);
    }
  };

  const handleBatchAddWords = async (
    newEntries: Array<{
      word_en: string;
      word_th: string;
      reading_th?: string;
      part_of_speech: PartOfSpeech;
      example_sentence_en: string;
      example_sentence_th: string;
    }>
  ) => {
    if (!set || !user || newEntries.length === 0) return;

    const payload = newEntries.map((e) => ({
      set_id: set.id,
      owner_id: user.id,
      word_en: e.word_en,
      word_th: e.word_th,
      audio_url: e.reading_th ? `reading_th:${e.reading_th}` : null,
      part_of_speech: e.part_of_speech,
      example_sentence_en: e.example_sentence_en,
      example_sentence_th: e.example_sentence_th,
    }));

    const { data, error } = await supabase
      .from('vocab_entries')
      .insert(payload)
      .select();

    if (error) throw error;
    if (data) {
      setEntries((prev) => [...prev, ...data]);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Delete this word from the set?')) return;
    try {
      const { error } = await supabase.from('vocab_entries').delete().eq('id', entryId);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      console.error('Error deleting word:', err);
    }
  };

  const handleUpdateEntry = async (updated: {
    id: string;
    word_en: string;
    word_th: string;
    reading_th: string;
    part_of_speech: PartOfSpeech;
    example_sentence_en: string;
    example_sentence_th: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('vocab_entries')
        .update({
          word_en: updated.word_en,
          word_th: updated.word_th,
          audio_url: `reading_th:${updated.reading_th}`,
          part_of_speech: updated.part_of_speech,
          example_sentence_en: updated.example_sentence_en,
          example_sentence_th: updated.example_sentence_th,
        })
        .eq('id', updated.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? data : e)));
      }
    } catch (err) {
      console.error('Error updating word:', err);
      throw err;
    }
  };

  if (isLoading || !set) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary">Loading vocabulary set...</p>
      </div>
    );
  }

  const isOwner = user?.id === set.owner_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Back Button */}
      <Link
        to="/sets"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sets
      </Link>

      {/* Set Header Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="noun" size="sm">
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                {entries.length} {entries.length === 1 ? 'word' : 'words'}
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

            {/* Editable Title */}
            {isEditingTitle && isOwner ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-2xl sm:text-3xl font-outfit font-bold text-text-primary px-2 py-1 rounded-lg border border-primary focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 rounded-xl bg-accent-green text-white hover:bg-accent-emerald"
                  title="Save title"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-text-primary">
                  {set.title}
                </h1>
                {isOwner && (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 text-text-secondary hover:text-primary transition-colors"
                    title="Edit title"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {set.description && (
              <p className="text-sm text-text-secondary italic max-w-2xl">{set.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {isOwner && (
              <Button variant="secondary" size="md" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Words (Photo / Text)
              </Button>
            )}
          </div>
        </div>

        {/* Study Modes Bar */}
        {entries.length > 0 && (
          <div className="pt-6 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              Choose Study Mode (5 Interactive Games)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* 1. Flashcards */}
              <Link to={`/sets/${set.id}/study/flashcard`} className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-start h-14 bg-gradient-to-r from-primary to-primary-hover shadow-sm"
                >
                  <Layers className="w-5 h-5 mr-2.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold">1. Flashcards</p>
                    <p className="text-[11px] font-normal opacity-90">Memory cards</p>
                  </div>
                </Button>
              </Link>

              {/* 2. Spelling Game */}
              <Link to={`/sets/${set.id}/study/spelling`} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-start h-14 border border-primary/20 hover:border-primary"
                >
                  <Headphones className="w-5 h-5 mr-2.5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-text-primary">2. Spelling Quiz</p>
                    <p className="text-[11px] font-normal text-text-secondary">Listen & spell</p>
                  </div>
                </Button>
              </Link>

              {/* 3. Multiple Choice */}
              <Link to={`/sets/${set.id}/study/multiple_choice`} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-start h-14 border border-primary/20 hover:border-primary"
                >
                  <HelpCircle className="w-5 h-5 mr-2.5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-text-primary">3. Quiz (Choice)</p>
                    <p className="text-[11px] font-normal text-text-secondary">4 Thai options</p>
                  </div>
                </Button>
              </Link>

              {/* 4. Word Matching */}
              <Link to={`/sets/${set.id}/study/matching`} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-start h-14 border border-primary/20 hover:border-primary"
                >
                  <Puzzle className="w-5 h-5 mr-2.5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-text-primary">4. Matching</p>
                    <p className="text-[11px] font-normal text-text-secondary">Pair EN & TH</p>
                  </div>
                </Button>
              </Link>

              {/* 5. Fill in the Blank */}
              <Link to={`/sets/${set.id}/study/fill_blank`} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-start h-14 border border-primary/20 hover:border-primary"
                >
                  <PenTool className="w-5 h-5 mr-2.5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-text-primary">5. Fill in Blank</p>
                    <p className="text-[11px] font-normal text-text-secondary">Sentence blanks</p>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Vocab Entries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-outfit font-bold text-text-primary">
            Vocabulary List ({entries.length})
          </h2>
          {isOwner && entries.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add More
            </Button>
          )}
        </div>

        {entries.length === 0 ? (
          <Card className="py-16 text-center space-y-4 border-dashed border-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-primary-light/60 flex items-center justify-center text-primary">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-outfit font-bold text-text-primary">No words in this set yet</h3>
              <p className="text-xs text-text-secondary mt-1">
                Add vocabulary using instant AI translation or by uploading textbook photos!
              </p>
            </div>
            {isOwner && (
              <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Add Words (Photo / Type)
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const phonetic = entry.audio_url
                ? entry.audio_url.replace(/^reading_th:/, '')
                : getThaiPhonetic(entry.word_en);
              return (
                <Card key={entry.id} className="p-4 sm:p-5 hover:border-primary/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Word & Audio & Phonetic */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-bold text-text-muted w-5">{index + 1}.</span>
                        <span className="text-xl font-outfit font-bold text-primary">
                          {entry.word_en}
                        </span>

                        {/* Phonetic Pronunciation Tag with Thai Audio Button */}
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold pl-2.5 pr-1.5 py-0.5 rounded-full bg-primary-light text-primary font-sarabun border border-primary/20">
                          อ่านว่า: {phonetic}
                          <button
                            type="button"
                            onClick={() => speakWord(phonetic, 'th')}
                            className="p-0.5 rounded-full hover:bg-primary/10 text-primary transition-colors"
                            title="ฟังเสียงอ่านภาษาไทย"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </span>

                        {/* English Audio Button */}
                        <button
                          type="button"
                          onClick={() => speakWord(entry.word_en, 'en')}
                          className="p-1.5 rounded-full text-text-secondary hover:text-primary hover:bg-primary-light transition-colors flex items-center gap-1 text-xs"
                          title="Listen to English pronunciation"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="text-[11px] font-semibold">EN</span>
                        </button>
                        <Badge pos={entry.part_of_speech} size="sm">
                          {entry.part_of_speech}
                        </Badge>
                      </div>

                      <div className="pl-8">
                        <p className="text-base font-sarabun text-text-primary font-medium">
                          {entry.word_th}
                        </p>
                        {entry.example_sentence_en && (
                          <p className="text-xs text-text-secondary mt-1">
                            "{entry.example_sentence_en}"
                            {entry.example_sentence_th && (
                              <span className="block font-sarabun text-text-muted mt-0.5">
                                ({entry.example_sentence_th})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    {isOwner && (
                      <div className="flex items-center justify-end gap-1.5 sm:self-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEntryForEdit(entry)}
                          className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary-light transition-colors"
                          title="Edit word card (แก้ไขคำศัพท์และคำอ่าน)"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 rounded-xl text-text-secondary hover:text-secondary hover:bg-secondary-light transition-colors"
                          title="Delete word"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Word Button on Mobile */}
      {isOwner && (
        <div className="fixed bottom-6 right-6 sm:hidden z-30">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-white shadow-primary-btn flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Add Words"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* Add Vocab Modal */}
      <AddVocabModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddWord}
        onBatchSave={handleBatchAddWords}
      />

      {/* Edit Vocab Modal */}
      <EditVocabModal
        isOpen={Boolean(selectedEntryForEdit)}
        onClose={() => setSelectedEntryForEdit(null)}
        entry={selectedEntryForEdit}
        onSave={handleUpdateEntry}
      />
    </div>
  );
};
