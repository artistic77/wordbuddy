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
  X,
  Puzzle,
  PenTool,
  CheckSquare,
  Square,
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

  // Bulk selection & deletion state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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
    setSelectedIds(new Set());
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

  // Add single word with duplicate prevention
  const handleAddWord = async (entry: {
    word_en: string;
    word_th: string;
    reading_th?: string;
    part_of_speech: PartOfSpeech;
    example_sentence_en: string;
    example_sentence_th: string;
  }) => {
    if (!set || !user) return;

    // Check duplicate
    const isDup = entries.some(
      (e) => e.word_en.trim().toLowerCase() === entry.word_en.trim().toLowerCase()
    );
    if (isDup) {
      alert(`คำว่า "${entry.word_en}" มีอยู่ในชุดคำศัพท์นี้แล้ว`);
      return;
    }

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

  // Add multiple words with duplicate filtering
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

    const existingLower = new Set(entries.map((e) => e.word_en.trim().toLowerCase()));
    const filtered = newEntries.filter((e) => !existingLower.has(e.word_en.trim().toLowerCase()));

    if (filtered.length === 0) {
      alert('ทุกคำในชุดนี้มีอยู่แล้วในชุดคำศัพท์');
      return;
    }

    const payload = filtered.map((e) => ({
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

  // Delete single word
  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Delete this word from the set?')) return;
    try {
      const { error } = await supabase.from('vocab_entries').delete().eq('id', entryId);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
    } catch (err) {
      console.error('Error deleting word:', err);
    }
  };

  // Batch delete multiple selected words
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected word${count > 1 ? 's' : ''} from this set?`)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      const { error } = await supabase.from('vocab_entries').delete().in('id', idsToDelete);
      if (error) throw error;

      setEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error deleting selected words:', err);
      alert('Failed to delete selected words. Please try again.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleToggleSelectEntry = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)));
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
  const isAllSelected = entries.length > 0 && selectedIds.size === entries.length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28">
      {/* Back Button */}
      <Link
        to="/sets"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sets
      </Link>

      {/* Set Header Card */}
      <Card className="p-4 sm:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="noun" size="sm">
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                {entries.length} {entries.length === 1 ? 'word' : 'words'}
              </Badge>
              {set.is_public ? (
                <Badge variant="adj" size="sm">
                  <Globe className="w-3.5 h-3.5 mr-1" /> Public
                </Badge>
              ) : (
                <Badge variant="other" size="sm">
                  <Lock className="w-3.5 h-3.5 mr-1" /> Private
                </Badge>
              )}
            </div>

            {/* Editable Title */}
            {isEditingTitle && isOwner ? (
              <div className="flex items-center gap-2 w-full max-w-xl">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setEditedTitle(set.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="flex-1 min-w-0 text-lg sm:text-2xl md:text-3xl font-outfit font-bold text-text-primary px-3 py-1.5 rounded-xl border-2 border-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="p-2 sm:p-2.5 rounded-xl bg-accent-green text-white hover:bg-accent-emerald transition-colors flex-shrink-0 shadow-sm"
                  title="Save title"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedTitle(set.title);
                    setIsEditingTitle(false);
                  }}
                  className="p-2 sm:p-2.5 rounded-xl bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors flex-shrink-0"
                  title="Cancel"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-outfit font-bold text-text-primary">
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
              <p className="text-xs sm:text-sm text-text-secondary italic max-w-2xl">{set.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isOwner && (
              <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Words (AI / Photo / Type)
              </Button>
            )}
          </div>
        </div>

        {/* Study Modes Bar */}
        {entries.length > 0 && (
          <div className="pt-5 border-t border-border">
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              Choose Study Mode (5 Interactive Games)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3">
              {/* 1. Flashcards */}
              <Link to={`/sets/${set.id}/study/flashcard`} className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-start h-13 sm:h-14 bg-gradient-to-r from-primary to-primary-hover shadow-sm"
                >
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 mr-2.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold">1. Flashcards</p>
                    <p className="text-[10px] sm:text-[11px] font-normal opacity-90">Memory cards</p>
                  </div>
                </Button>
              </Link>

              {/* 2. Spelling Game */}
              <Link to={`/sets/${set.id}/study/spelling`} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-start h-13 sm:h-14 border border-primary/20 hover:border-primary"
                >
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5 mr-2.5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-text-primary">2. Spelling Quiz</p>
                    <p className="text-[10px] sm:text-[11px] font-normal text-text-secondary">Listen & spell</p>
                  </div>
                </Button>
              </Link>

              {/* 3. Multiple Choice */}
              <Link to={`/sets/${set.id}/study/multiple_choice`} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-start h-13 sm:h-14 border border-primary/20 hover:border-primary"
                >
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2.5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-text-primary">3. Quiz (Choice)</p>
                    <p className="text-[10px] sm:text-[11px] font-normal text-text-secondary">4 Thai options</p>
                  </div>
                </Button>
              </Link>

              {/* 4. Word Matching */}
              <Link to={`/sets/${set.id}/study/matching`} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-start h-13 sm:h-14 border border-primary/20 hover:border-primary"
                >
                  <Puzzle className="w-4 h-4 sm:w-5 sm:h-5 mr-2.5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-text-primary">4. Matching</p>
                    <p className="text-[10px] sm:text-[11px] font-normal text-text-secondary">Pair EN & TH</p>
                  </div>
                </Button>
              </Link>

              {/* 5. Fill in the Blank */}
              <Link to={`/sets/${set.id}/study/fill_blank`} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-start h-13 sm:h-14 border border-primary/20 hover:border-primary"
                >
                  <PenTool className="w-4 h-4 sm:w-5 sm:h-5 mr-2.5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-text-primary">5. Fill in Blank</p>
                    <p className="text-[10px] sm:text-[11px] font-normal text-text-secondary">Sentence blanks</p>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Vocab Entries List Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-outfit font-bold text-text-primary">
              Vocabulary List ({entries.length})
            </h2>
            {isOwner && entries.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-light/50 border border-primary/20 transition-colors"
              >
                {isAllSelected ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Select All ({entries.length})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {isOwner && entries.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add More
              </Button>
            </div>
          )}
        </div>

        {/* Bulk Action Sticky/Floating Bar */}
        {isOwner && selectedIds.size > 0 && (
          <div className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-secondary/30 shadow-modal flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up sticky top-4 z-20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-secondary-light text-secondary flex items-center justify-center font-bold text-sm">
                {selectedIds.size}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-text-primary">
                  Selected {selectedIds.size} of {entries.length} words
                </p>
                <p className="text-[11px] text-text-secondary">
                  Ready for batch removal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Cancel Selection
              </Button>

              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleBatchDelete}
                isLoading={isBulkDeleting}
                className="bg-secondary text-white hover:bg-secondary-hover shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Selected ({selectedIds.size})
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {entries.length === 0 ? (
          <Card className="py-14 sm:py-16 text-center space-y-4 border-dashed border-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-3xl bg-primary-light/60 flex items-center justify-center text-primary">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="px-4">
              <h3 className="text-base sm:text-lg font-outfit font-bold text-text-primary">
                No words in this set yet
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                Add vocabulary using instant AI prompts, photo worksheet scanning, or typing!
              </p>
            </div>
            {isOwner && (
              <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Add Words (AI / Photo / Type)
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {entries.map((entry, index) => {
              const phonetic = entry.audio_url
                ? entry.audio_url.replace(/^reading_th:/, '')
                : getThaiPhonetic(entry.word_en);
              const isSelected = selectedIds.has(entry.id);

              return (
                <Card
                  key={entry.id}
                  className={`p-3.5 sm:p-4 md:p-5 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-light/10 shadow-sm'
                      : 'hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Left: Checkbox + Word Info */}
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleToggleSelectEntry(entry.id)}
                          className="mt-1 sm:mt-0 p-1 text-primary hover:scale-110 active:scale-95 transition-transform flex-shrink-0"
                          aria-label={isSelected ? 'Deselect word' : 'Select word'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 hover:text-primary" />
                          )}
                        </button>
                      )}

                      <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                        {/* Word line + Phonetics + POS Badge + EN Audio */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-muted select-none w-5">
                            {index + 1}.
                          </span>
                          <span className="text-base sm:text-lg md:text-xl font-outfit font-bold text-primary truncate max-w-[180px] sm:max-w-none">
                            {entry.word_en}
                          </span>

                          {/* Phonetic Pronunciation Tag */}
                          <span className="inline-flex items-center text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-primary-light text-primary font-sarabun border border-primary/20">
                            อ่านว่า: {phonetic}
                          </span>

                          {/* English Audio Button */}
                          <button
                            type="button"
                            onClick={() => speakWord(entry.word_en, 'en')}
                            className="p-1 sm:p-1.5 rounded-full text-text-secondary hover:text-primary hover:bg-primary-light transition-colors flex items-center gap-1 text-xs flex-shrink-0"
                            title="Listen to English pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="text-[10px] sm:text-[11px] font-semibold">EN</span>
                          </button>

                          <Badge pos={entry.part_of_speech} size="sm">
                            {entry.part_of_speech}
                          </Badge>
                        </div>

                        {/* Thai meaning and example sentences */}
                        <div className="pl-6 sm:pl-7">
                          <p className="text-sm sm:text-base font-sarabun text-text-primary font-medium">
                            {entry.word_th}
                          </p>
                          {entry.example_sentence_en && (
                            <p className="text-xs text-text-secondary mt-0.5 sm:mt-1 leading-relaxed">
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
                    </div>

                    {/* Right: Actions */}
                    {isOwner && (
                      <div className="flex items-center justify-end gap-1 flex-shrink-0 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEntryForEdit(entry)}
                          className="p-1.5 sm:p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary-light transition-colors"
                          title="Edit word card (แก้ไขคำศัพท์และคำอ่าน)"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 sm:p-2 rounded-xl text-text-secondary hover:text-secondary hover:bg-secondary-light transition-colors"
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

      {/* Add Vocab Modal with Duplicate Prevention */}
      <AddVocabModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingWords={entries.map((e) => e.word_en)}
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
