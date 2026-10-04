import React, { useState, useEffect, useMemo } from 'react';
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
  Star,
  Copy,
  User as UserIcon,
  CheckCircle2,
  Clock,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { favoriteService } from '../../services/favoriteService';
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
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState<VocabEntry | null>(null);

  // Overflow menu & delete modal state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Bulk selection & deletion state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeletingSet, setIsDeletingSet] = useState(false);

  // Mastery filter & study scope states
  const [filterStatus, setFilterStatus] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [studyScope, setStudyScope] = useState<'unmastered' | 'all'>('unmastered');
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  // Inline title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const fetchSetData = async (showLoadingSpinner = !set) => {
    if (!id) return;
    if (showLoadingSpinner) setIsLoading(true);
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

      // 2. Fetch author profile if not owned by user
      if (setData.owner_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', setData.owner_id)
          .single();
        if (profileData) {
          setAuthorName(profileData.display_name);
        }
      }

      // 3. Fetch favorite status
      if (user) {
        const favIds = await favoriteService.getUserFavoriteSetIds(user.id);
        setIsFavorited(favIds.has(id));
      }

      // 4. Fetch vocab entries
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
  }, [id, user?.id]);

  const handleTogglePrivacy = async () => {
    if (!set || user?.id !== set.owner_id) return;
    const newPrivacy = !set.is_public;
    const confirmMsg = newPrivacy
      ? 'Make this set Public? Anyone will be able to discover, favorite, and study it.'
      : 'Make this set Private? Only you will be able to view and study it.';
    if (!window.confirm(confirmMsg)) return;

    setIsTogglingPrivacy(true);
    try {
      const { error } = await supabase
        .from('vocab_sets')
        .update({ is_public: newPrivacy })
        .eq('id', set.id);

      if (error) throw error;
      setSet((prev) => (prev ? { ...prev, is_public: newPrivacy } : null));
    } catch (err) {
      console.error('Failed to toggle privacy:', err);
      alert('Failed to update privacy setting.');
    } finally {
      setIsTogglingPrivacy(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!set || !user) {
      navigate('/auth/login');
      return;
    }
    setIsTogglingFavorite(true);
    try {
      const newFav = await favoriteService.toggleFavoriteSet(user.id, set.id, isFavorited);
      setIsFavorited(newFav);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleCopySet = async () => {
    if (!set || !user) {
      navigate('/auth/login');
      return;
    }
    setIsCopying(true);
    try {
      const { data: newSet, error: setErr } = await supabase
        .from('vocab_sets')
        .insert({
          owner_id: user.id,
          title: `${set.title} (Copy)`,
          description: set.description,
          is_public: false,
        })
        .select()
        .single();

      if (setErr || !newSet) throw setErr;

      if (entries.length > 0) {
        const cloned = entries.map((e) => ({
          set_id: newSet.id,
          owner_id: user.id,
          word_en: e.word_en,
          word_th: e.word_th,
          audio_url: e.audio_url,
          part_of_speech: e.part_of_speech,
          example_sentence_en: e.example_sentence_en,
          example_sentence_th: e.example_sentence_th,
        }));
        await supabase.from('vocab_entries').insert(cloned);
      }

      setCopiedSuccess(true);
      setTimeout(() => {
        setCopiedSuccess(false);
        navigate(`/sets/${newSet.id}`);
      }, 1000);
    } catch (err) {
      console.error('Failed to copy set:', err);
      alert('Failed to copy set.');
    } finally {
      setIsCopying(false);
    }
  };

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

  const handleDeleteSet = async () => {
    if (!set || user?.id !== set.owner_id) return;
    setIsDeletingSet(true);
    try {
      const { error } = await supabase.from('vocab_sets').delete().eq('id', set.id);
      if (error) throw error;
      setShowDeleteConfirm(false);
      navigate('/sets');
    } catch (err) {
      console.error('Failed to delete vocab set:', err);
      alert('ลบชุดคำศัพท์ไม่สำเร็จ');
      setIsDeletingSet(false);
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

    const reading = entry.reading_th?.trim() || getThaiPhonetic(entry.word_en);
    const { data, error } = await supabase
      .from('vocab_entries')
      .insert({
        set_id: set.id,
        owner_id: user.id,
        word_en: entry.word_en,
        word_th: entry.word_th,
        audio_url: reading ? `reading_th:${reading}` : null,
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

    const payload = filtered.map((e) => {
      const reading = e.reading_th?.trim() || getThaiPhonetic(e.word_en);
      return {
        set_id: set.id,
        owner_id: user.id,
        word_en: e.word_en,
        word_th: e.word_th,
        audio_url: reading ? `reading_th:${reading}` : null,
        part_of_speech: e.part_of_speech,
        example_sentence_en: e.example_sentence_en,
        example_sentence_th: e.example_sentence_th,
      };
    });

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
      const reading = updated.reading_th?.trim() || getThaiPhonetic(updated.word_en);
      const { data, error } = await supabase
        .from('vocab_entries')
        .update({
          word_en: updated.word_en,
          word_th: updated.word_th,
          audio_url: reading ? `reading_th:${reading}` : null,
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

  // Toggle single word mastery status
  const handleToggleMastered = async (entryId: string, currentStatus: boolean) => {
    if (!isOwner) {
      alert('คุณสามารถคัดลอกชุดคำศัพท์นี้ไปยัง "ชุดคำศัพท์ของฉัน" เพื่อบันทึกสถานะการเรียนรู้ส่วนตัวได้ครับ');
      return;
    }
    const newStatus = !currentStatus;
    // Optimistic UI update
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, is_mastered: newStatus } : e))
    );

    try {
      const { error } = await supabase
        .from('vocab_entries')
        .update({ is_mastered: newStatus })
        .eq('id', entryId);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update word status:', err);
      // Rollback on error
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, is_mastered: currentStatus } : e))
      );
    }
  };

  // Batch toggle mastery status for selected words
  const handleBatchSetMastered = async (status: boolean) => {
    if (selectedIds.size === 0 || !isOwner) return;
    setIsBatchUpdating(true);
    const ids = Array.from(selectedIds);

    // Optimistic UI update
    setEntries((prev) =>
      prev.map((e) => (selectedIds.has(e.id) ? { ...e, is_mastered: status } : e))
    );
    setSelectedIds(new Set());

    try {
      const { error } = await supabase
        .from('vocab_entries')
        .update({ is_mastered: status })
        .in('id', ids);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to batch update word status:', err);
      fetchSetData();
    } finally {
      setIsBatchUpdating(false);
    }
  };

  const masteredCount = useMemo(() => entries.filter((e) => e.is_mastered).length, [entries]);
  const unmasteredCount = useMemo(() => entries.length - masteredCount, [entries, masteredCount]);
  const masteryPercentage = entries.length > 0 ? Math.round((masteredCount / entries.length) * 100) : 0;

  const filteredEntries = useMemo(() => {
    if (filterStatus === 'mastered') return entries.filter((e) => e.is_mastered);
    if (filterStatus === 'unmastered') return entries.filter((e) => !e.is_mastered);
    return entries;
  }, [entries, filterStatus]);

  if (isLoading || !set) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
        <div className="h-5 w-32 bg-neutral-200 rounded-lg" />

        {/* Header Card Skeleton */}
        <div className="p-6 bg-white rounded-2xl border border-border space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-28 bg-neutral-200 rounded-full" />
            <div className="h-8 w-8 bg-neutral-200 rounded-xl" />
          </div>
          <div className="h-8 w-64 bg-neutral-200 rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-neutral-100 rounded" />
          <div className="h-11 w-full bg-neutral-200 rounded-xl" />

          {/* Progress & Stats Skeleton */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="h-3 w-full bg-neutral-200 rounded-full" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 bg-neutral-100 rounded-xl" />
              <div className="h-16 bg-neutral-100 rounded-xl" />
              <div className="h-16 bg-neutral-100 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Word List Skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-40 bg-neutral-200 rounded-lg" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-xl border border-border flex items-center justify-between"
            >
              <div className="space-y-2 flex-1">
                <div className="h-5 w-36 bg-neutral-200 rounded" />
                <div className="h-4 w-48 bg-neutral-100 rounded" />
              </div>
              <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
            </div>
          ))}
        </div>
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
        กลับหน้ารายการชุดคำศัพท์
      </Link>

      {/* Set Header Card */}
      <Card className="p-4 sm:p-6 space-y-5">
        <div className="space-y-4">
          {/* Top Row: Word count & Privacy Toggle (Left) + Overflow Menu (Right) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="noun" size="sm">
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                {entries.length} คำ
              </Badge>

              {/* Real Privacy Toggle: label "การมองเห็น" + Switch (ส่วนตัว / สาธารณะ) */}
              {isOwner ? (
                <div className="flex items-center gap-2 bg-surface-subtle px-2.5 py-1 rounded-xl border border-border">
                  <span className="text-xs font-semibold text-text-secondary">การมองเห็น:</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={set.is_public}
                    aria-label="สลับการมองเห็น ส่วนตัว หรือ สาธารณะ"
                    onClick={handleTogglePrivacy}
                    disabled={isTogglingPrivacy}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      set.is_public ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        set.is_public ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-text-primary">
                    {set.is_public ? 'สาธารณะ' : 'ส่วนตัว'}
                  </span>
                </div>
              ) : (
                <>
                  <Badge variant={set.is_public ? 'adj' : 'other'} size="sm">
                    {set.is_public ? (
                      <>
                        <Globe className="w-3.5 h-3.5 mr-1" /> สาธารณะ
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 mr-1" /> ส่วนตัว
                      </>
                    )}
                  </Badge>
                  {authorName && (
                    <Badge variant="default" size="sm" className="bg-slate-100 text-slate-700 border-slate-200">
                      <UserIcon className="w-3.5 h-3.5 mr-1" /> โดย {authorName}
                    </Badge>
                  )}
                </>
              )}
            </div>

            {/* Overflow "⋯" Menu for Destructive Action */}
            {isOwner && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-label="ตัวเลือกเพิ่มเติม"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-border bg-white text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-xl bg-white border border-border shadow-modal py-1 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full min-h-[44px] px-3.5 py-2 text-left text-xs font-semibold text-danger hover:bg-danger-light flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-danger flex-shrink-0" />
                        ลบชุดคำศัพท์
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Title Row with Secondary Favorite Button inline */}
          <div className="space-y-1">
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
                  className="flex-1 min-w-0 text-lg sm:text-2xl font-outfit font-bold text-text-primary px-3 py-1.5 rounded-xl border-2 border-primary bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-xs"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-success text-white hover:bg-success-hover transition-colors flex-shrink-0 shadow-xs"
                  title="บันทึกชื่อ"
                  aria-label="บันทึกชื่อ"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedTitle(set.title);
                    setIsEditingTitle(false);
                  }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-neutral-100 text-text-secondary hover:bg-neutral-200 transition-colors flex-shrink-0"
                  title="ยกเลิก"
                  aria-label="ยกเลิก"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-outfit font-bold text-text-primary tracking-tight">
                  {set.title}
                </h1>
                {/* Secondary Favorite Button: Icon-only button next to set title */}
                {user && (
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    aria-label={isFavorited ? 'นำออกจากชุดโปรด' : 'บันทึกเป็นชุดโปรด'}
                    title={isFavorited ? 'นำออกจากชุดโปรด' : 'บันทึกเป็นชุดโปรด'}
                    className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all ${
                      isFavorited
                        ? 'bg-amber-50 text-amber-500 border-amber-300 shadow-xs'
                        : 'bg-white text-text-muted border-border hover:border-amber-300 hover:text-amber-500'
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isFavorited ? 'fill-amber-400 text-amber-500' : 'text-text-muted'
                      }`}
                    />
                  </button>
                )}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(true)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                    title="แก้ไขชื่อชุดคำศัพท์"
                    aria-label="แก้ไขชื่อชุดคำศัพท์"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {set.description && (
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
                {set.description}
              </p>
            )}
          </div>

          {/* PRIMARY ACTION: Full width, filled */}
          <div>
            {isOwner ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full min-h-[44px] font-bold text-sm sm:text-base shadow-sm"
              >
                <Plus className="w-5 h-5 mr-1.5" />
                + เพิ่มคำศัพท์
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopySet}
                disabled={isCopying || copiedSuccess}
                className="w-full min-h-[44px] border-primary/20 text-primary font-bold text-sm sm:text-base"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-success" />
                    คัดลอกเข้าชุดคำศัพท์ของฉันแล้ว!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    {isCopying ? 'กำลังคัดลอก...' : 'คัดลอกเข้าชุดคำศัพท์ของฉัน'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mastery Stats & Progress Banner */}
        {entries.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-xs space-y-3">
            {/* Header: Progress title and "0/15 คำ (0%)" above progress bar */}
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="font-bold text-text-primary">ความคืบหน้าการเรียนรู้</span>
              <span className="font-outfit font-bold text-primary">
                {masteredCount}/{entries.length} คำ ({masteryPercentage}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>

            {/* Grid-cols-3 Stat Badges: Consistent styling, only active filter is highlighted */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => setFilterStatus('mastered')}
                className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                  filterStatus === 'mastered'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                    : 'bg-white border-border hover:border-emerald-300'
                }`}
                title="คลิกเพื่อกรองเฉพาะคำที่จำได้แล้ว"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] sm:text-xs text-text-muted truncate">จำได้แล้ว</p>
                <p className="text-base sm:text-lg font-bold font-outfit text-emerald-700">
                  {masteredCount} <span className="text-[10px] font-normal text-text-muted">คำ</span>
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('unmastered')}
                className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                  filterStatus === 'unmastered'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                    : 'bg-white border-border hover:border-amber-300'
                }`}
                title="คลิกเพื่อกรองเฉพาะคำที่ยังจำไม่ได้"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-1">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] sm:text-xs text-text-muted truncate">ยังจำไม่ได้</p>
                <p className="text-base sm:text-lg font-bold font-outfit text-amber-700">
                  {unmasteredCount} <span className="text-[10px] font-normal text-text-muted">คำ</span>
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                  filterStatus === 'all'
                    ? 'bg-indigo-50 border-primary ring-2 ring-primary/20'
                    : 'bg-white border-border hover:border-primary/40'
                }`}
                title="คลิกเพื่อดูคำศัพท์ทั้งหมด"
              >
                <div className="w-6 h-6 rounded-lg bg-primary-light text-primary flex items-center justify-center mx-auto mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] sm:text-xs text-text-muted truncate">ทั้งหมด</p>
                <p className="text-base sm:text-lg font-bold font-outfit text-primary">
                  {entries.length} <span className="text-[10px] font-normal text-text-muted">คำ</span>
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Study Modes Bar */}
        {entries.length > 0 && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                โหมดฝึกฝนคำศัพท์ (5 เกมการเรียนรู้)
              </h3>

              {/* Study Scope Toggle: Proper segmented control, equal widths, no overflow */}
              <div className="w-full sm:w-72 grid grid-cols-2 p-1 bg-surface-subtle rounded-xl border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStudyScope('unmastered')}
                  className={`min-h-[44px] py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center truncate ${
                    studyScope === 'unmastered'
                      ? 'bg-white text-amber-800 shadow-xs border border-amber-300 font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate">ยังจำไม่ได้ ({unmasteredCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudyScope('all')}
                  className={`min-h-[44px] py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center truncate ${
                    studyScope === 'all'
                      ? 'bg-white text-primary shadow-xs border border-primary/20 font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">ฝึกทั้งหมด ({entries.length})</span>
                </button>
              </div>
            </div>

            {/* Hint if all words are mastered and scope is unmastered */}
            {studyScope === 'unmastered' && unmasteredCount === 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>ยอดเยี่ยมมาก! คุณจำคำศัพท์ในชุดนี้ได้ครบทุกคำแล้ว โหมดฝึกจะทบทวนคำศัพท์ทั้งหมดให้ครับ</span>
              </div>
            )}

            {/* ONE consistent card style for all 5 games (number badge + title + subtitle + chevron) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {[
                {
                  num: 1,
                  title: 'Flashcards',
                  sub: 'เปิดดูการ์ด ฟังเสียงอ่าน',
                  icon: Layers,
                  path: 'flashcard',
                },
                {
                  num: 2,
                  title: 'Spelling Quiz',
                  sub: 'ฟังเสียงและสะกดคำ',
                  icon: Headphones,
                  path: 'spelling',
                },
                {
                  num: 3,
                  title: 'Choice Quiz',
                  sub: 'ปรนัย 4 ตัวเลือก',
                  icon: HelpCircle,
                  path: 'multiple_choice',
                },
                {
                  num: 4,
                  title: 'Matching',
                  sub: 'จับคู่คำศัพท์ EN-TH',
                  icon: Puzzle,
                  path: 'matching',
                },
                {
                  num: 5,
                  title: 'Fill in Blank',
                  sub: 'เติมคำในช่องว่าง',
                  icon: PenTool,
                  path: 'fill_blank',
                },
              ].map((game) => {
                const Icon = game.icon;
                return (
                  <Link
                    key={game.path}
                    to={`/sets/${set.id}/study/${game.path}?scope=${studyScope}`}
                    className="block group"
                  >
                    <div className="min-h-[56px] p-3 rounded-xl bg-white border border-border hover:border-primary/40 hover:shadow-card transition-all flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary-light text-primary flex items-center justify-center font-outfit font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                          {game.num}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors flex items-center gap-1">
                            <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="truncate">{game.title}</span>
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {game.sub}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Vocab Entries List Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl font-outfit font-bold text-text-primary">
              Vocabulary List ({filteredEntries.length})
            </h2>

            {/* Filter segmented buttons */}
            <div className="inline-flex p-1 bg-surface-muted rounded-xl border border-border/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-white text-primary shadow-xs font-bold border border-primary/20'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                ทั้งหมด ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('unmastered')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  filterStatus === 'unmastered'
                    ? 'bg-white text-amber-700 shadow-xs font-bold border border-amber-200'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                ยังจำไม่ได้ ({unmasteredCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('mastered')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  filterStatus === 'mastered'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold border border-emerald-200'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                จำได้แล้ว ({masteredCount})
              </button>
            </div>

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
                  Ready for batch action
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
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
                variant="secondary"
                size="sm"
                onClick={() => handleBatchSetMastered(true)}
                disabled={isBatchUpdating}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300"
                title="Mark selected words as mastered"
              >
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                จำได้แล้ว ({selectedIds.size})
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleBatchSetMastered(false)}
                disabled={isBatchUpdating}
                className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-300"
                title="Mark selected words as still learning"
              >
                <Clock className="w-4 h-4 mr-1 text-amber-600" />
                ยังจำไม่ได้ ({selectedIds.size})
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
        ) : filteredEntries.length === 0 ? (
          <Card className="py-12 text-center space-y-3 border-dashed border-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-muted flex items-center justify-center text-text-muted">
              {filterStatus === 'mastered' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Clock className="w-6 h-6 text-amber-500" />}
            </div>
            <p className="text-sm font-semibold text-text-primary">
              {filterStatus === 'mastered' ? 'ยังไม่มีคำศัพท์ที่ทำเครื่องหมายว่าจำได้แล้ว' : 'ไม่มีคำศัพท์ที่ยังจำไม่ได้ (จำได้ครบทุกคำแล้ว!)'}
            </p>
            <Button variant="secondary" size="sm" onClick={() => setFilterStatus('all')}>
              แสดงคำศัพท์ทั้งหมด ({entries.length})
            </Button>
          </Card>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {filteredEntries.map((entry, index) => {
              const phonetic = entry.audio_url
                ? entry.audio_url.replace(/^reading_th:/, '')
                : getThaiPhonetic(entry.word_en);
              const isSelected = selectedIds.has(entry.id);

              return (
                <Card
                  key={entry.id}
                  className={`p-3.5 sm:p-4 md:p-5 transition-all ${
                    entry.is_mastered ? 'border-emerald-200/80 bg-emerald-50/20' : ''
                  } ${
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
                        {/* Word line + Phonetics + POS Badge + Status Flag + EN Audio */}
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

                          {/* Quick Toggle Status Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleMastered(entry.id, entry.is_mastered)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer ${
                              entry.is_mastered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                            }`}
                            title={
                              entry.is_mastered
                                ? 'จำได้แล้ว (คลิกเพื่อเปลี่ยนเป็นยังจำไม่ได้)'
                                : 'ยังจำไม่ได้ (คลิกเพื่อบันทึกว่าจำได้แล้ว)'
                            }
                          >
                            {entry.is_mastered ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>จำได้แล้ว</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>ยังจำไม่ได้</span>
                              </>
                            )}
                          </button>
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

      {/* Delete Set Confirm Dialog Modal */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-set-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-modal border border-border space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-danger-light text-danger flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 id="delete-set-title" className="text-lg font-outfit font-bold text-text-primary">
                ยืนยันการลบชุดคำศัพท์
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการลบชุดคำศัพท์ &ldquo;{set.title}&rdquo; และคำศัพท์ทั้งหมด {entries.length} คำ? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-2 pt-2">
              <Button
                variant="danger"
                size="md"
                className="w-full sm:w-auto min-h-[44px]"
                onClick={handleDeleteSet}
                disabled={isDeletingSet}
                isLoading={isDeletingSet}
              >
                ลบชุดคำศัพท์
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                className="w-full sm:w-auto min-h-[44px] text-text-secondary hover:text-text-primary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingSet}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
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
