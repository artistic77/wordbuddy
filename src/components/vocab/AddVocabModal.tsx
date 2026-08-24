import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Upload,
  Volume2,
  Copy,
  Check,
  CheckSquare,
  Square,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  Wand2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  translateWord,
  extractVocabSheetFromImage,
  batchTranslateWords,
  generateVocabFromPrompt,
} from '../../services/aiService';
import { speakWord } from '../../services/ttsService';
import { getThaiPhonetic } from '../../services/phoneticService';
import type { PartOfSpeech, TranslationResponse } from '../../types';

export interface VocabEntryDraft {
  id: string;
  word_en: string;
  word_th: string;
  reading_th?: string;
  part_of_speech: PartOfSpeech;
  example_sentence_en: string;
  example_sentence_th: string;
  selected: boolean;
  isExpanded?: boolean;
  isDuplicate?: boolean;
}

interface AddVocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingWords?: string[];
  onSave: (entry: {
    word_en: string;
    word_th: string;
    reading_th?: string;
    part_of_speech: PartOfSpeech;
    example_sentence_en: string;
    example_sentence_th: string;
  }) => Promise<void>;
  onBatchSave?: (
    entries: Array<{
      word_en: string;
      word_th: string;
      reading_th?: string;
      part_of_speech: PartOfSpeech;
      example_sentence_en: string;
      example_sentence_th: string;
    }>
  ) => Promise<void>;
}

export const AddVocabModal: React.FC<AddVocabModalProps> = ({
  isOpen,
  onClose,
  existingWords = [],
  onSave,
  onBatchSave,
}) => {
  const [activeTab, setActiveTab] = useState<'type' | 'prompt' | 'photo'>('type');

  // Existing words set for instant duplicate lookup
  const existingSet = useMemo(() => {
    return new Set(existingWords.map((w) => w.trim().toLowerCase()).filter(Boolean));
  }, [existingWords]);

  // Tab 1: Single word form state
  const [wordEn, setWordEn] = useState('');
  const [wordTh, setWordTh] = useState('');
  const [readingTh, setReadingTh] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleTh, setExampleTh] = useState('');

  // Tab 2: AI Prompt generation state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState<number>(10);
  const [promptDrafts, setPromptDrafts] = useState<VocabEntryDraft[]>([]);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Tab 3: Batch Photo/Worksheet OCR state
  const [extractedWords, setExtractedWords] = useState<VocabEntryDraft[]>([]);
  const [detectedSheetTitle, setDetectedSheetTitle] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchStepMessage, setBatchStepMessage] = useState<string | null>(null);

  // Common UI state
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Single word duplicate check
  const isSingleWordDuplicate = wordEn.trim() ? existingSet.has(wordEn.trim().toLowerCase()) : false;

  const handleTranslate = async () => {
    if (!wordEn.trim()) {
      setError('Please type an English word first.');
      return;
    }

    setError(null);
    setIsTranslating(true);
    try {
      const res = await translateWord(wordEn.trim());
      setWordTh(res.word_th);
      setReadingTh(res.reading_th || getThaiPhonetic(wordEn.trim()));
      setPartOfSpeech(res.part_of_speech || 'noun');
      setExampleEn(res.example_sentence_en || '');
      setExampleTh(res.example_sentence_th || '');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  // --------------------------------------------------------------------------
  // Tab 2: AI Prompt Generator
  // --------------------------------------------------------------------------
  const handleGeneratePromptVocab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) {
      setError('Please describe what vocabulary you would like AI to generate.');
      return;
    }

    setError(null);
    setIsGeneratingPrompt(true);
    try {
      const safeCount = Math.min(Math.max(Number(aiCount) || 10, 1), 50);
      const results = await generateVocabFromPrompt(aiPrompt.trim(), safeCount, existingWords);

      if (!results || results.length === 0) {
        throw new Error('AI could not generate vocabulary for this topic. Please try a more specific topic.');
      }

      const drafts: VocabEntryDraft[] = results.map((t, idx) => {
        const isDup = existingSet.has(t.word_en.trim().toLowerCase());
        return {
          id: `prompt-draft-${idx}-${Date.now()}`,
          word_en: t.word_en,
          word_th: t.word_th,
          reading_th: t.reading_th || '',
          part_of_speech: t.part_of_speech,
          example_sentence_en: t.example_sentence_en,
          example_sentence_th: t.example_sentence_th,
          selected: !isDup, // Automatically uncheck duplicate words
          isExpanded: false,
          isDuplicate: isDup,
        };
      });

      setPromptDrafts(drafts);
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || 'Failed to generate vocabulary with AI.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleToggleSelectPromptWord = (id: string) => {
    setPromptDrafts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const handleToggleSelectAllPrompt = () => {
    const allSelected = promptDrafts.every((w) => w.selected);
    setPromptDrafts((prev) => prev.map((w) => ({ ...w, selected: !allSelected })));
  };

  const handleUpdatePromptDraftWord = (id: string, field: keyof VocabEntryDraft, value: any) => {
    setPromptDrafts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleDeletePromptDraftWord = (id: string) => {
    setPromptDrafts((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleExpandPromptWord = (id: string) => {
    setPromptDrafts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isExpanded: !w.isExpanded } : w))
    );
  };

  const handleBatchSavePromptWords = async () => {
    const selectedWords = promptDrafts.filter((w) => w.selected);
    if (selectedWords.length === 0) {
      setError('Please select at least one word to import.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = selectedWords.map((w) => ({
        word_en: w.word_en.trim(),
        word_th: w.word_th.trim(),
        reading_th: w.reading_th?.trim() || getThaiPhonetic(w.word_en.trim()),
        part_of_speech: w.part_of_speech,
        example_sentence_en: w.example_sentence_en.trim(),
        example_sentence_th: w.example_sentence_th.trim(),
      }));

      if (onBatchSave) {
        await onBatchSave(payload);
      } else {
        for (const item of payload) {
          await onSave(item);
        }
      }

      setPromptDrafts([]);
      setAiPrompt('');
      onClose();
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || 'Failed to import words.');
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Tab 3: Photo / Worksheet Scan
  // --------------------------------------------------------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDetectedSheetTitle(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setIsProcessingBatch(true);
      setBatchStepMessage('Scanning worksheet with Multimodal AI Vision...');

      try {
        // 1. Extract vocabulary words & sheet title using Multimodal Vision AI
        const sheetResult = await extractVocabSheetFromImage(base64, file.type);
        const rawWords = sheetResult.words;

        if (sheetResult.title) {
          setDetectedSheetTitle(sheetResult.title);
        }

        if (!rawWords || rawWords.length === 0) {
          setError('No clear English vocabulary words found in this image. Please try another photo.');
          setIsProcessingBatch(false);
          return;
        }

        setBatchStepMessage(`AI identified ${rawWords.length} words! Generating Thai meanings & pronunciations...`);

        // 2. Batch translate all extracted words
        const translations: TranslationResponse[] = await batchTranslateWords(rawWords);

        // 3. Populate batch draft list with duplicate check
        const drafts: VocabEntryDraft[] = translations.map((t, idx) => {
          const isDup = existingSet.has(t.word_en.trim().toLowerCase());
          return {
            id: `draft-${idx}-${Date.now()}`,
            word_en: t.word_en,
            word_th: t.word_th,
            reading_th: t.reading_th || '',
            part_of_speech: t.part_of_speech,
            example_sentence_en: t.example_sentence_en,
            example_sentence_th: t.example_sentence_th,
            selected: !isDup, // Automatically uncheck duplicate words
            isExpanded: false,
            isDuplicate: isDup,
          };
        });

        setExtractedWords(drafts);
      } catch (err: unknown) {
        const errObj = err as Error;
        setError(errObj.message || 'Failed to extract words from photo.');
      } finally {
        setIsProcessingBatch(false);
        setBatchStepMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSelectWord = (id: string) => {
    setExtractedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = extractedWords.every((w) => w.selected);
    setExtractedWords((prev) => prev.map((w) => ({ ...w, selected: !allSelected })));
  };

  const handleToggleExpandWord = (id: string) => {
    setExtractedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isExpanded: !w.isExpanded } : w))
    );
  };

  const handleUpdateDraftWord = (id: string, field: keyof VocabEntryDraft, value: any) => {
    setExtractedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleDeleteDraftWord = (id: string) => {
    setExtractedWords((prev) => prev.filter((w) => w.id !== id));
  };

  // Single word save
  const handleSingleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordEn.trim() || !wordTh.trim()) {
      setError('Both English word and Thai translation are required.');
      return;
    }

    if (isSingleWordDuplicate) {
      setError(`Word "${wordEn.trim()}" already exists in this set.`);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const finalReading = readingTh.trim() || getThaiPhonetic(wordEn.trim());
      await onSave({
        word_en: wordEn.trim(),
        word_th: wordTh.trim(),
        reading_th: finalReading,
        part_of_speech: partOfSpeech,
        example_sentence_en: exampleEn.trim(),
        example_sentence_th: exampleTh.trim(),
      });
      // Reset
      setWordEn('');
      setWordTh('');
      setReadingTh('');
      setExampleEn('');
      setExampleTh('');
      setImagePreview(null);
      onClose();
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || 'Failed to save vocabulary.');
    } finally {
      setIsSaving(false);
    }
  };

  // Batch multi-word save from photo scan
  const handleBatchSavePhoto = async () => {
    const selectedWords = extractedWords.filter((w) => w.selected);
    if (selectedWords.length === 0) {
      setError('Please select at least one word to import.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = selectedWords.map((w) => ({
        word_en: w.word_en.trim(),
        word_th: w.word_th.trim(),
        reading_th: w.reading_th?.trim() || getThaiPhonetic(w.word_en.trim()),
        part_of_speech: w.part_of_speech,
        example_sentence_en: w.example_sentence_en.trim(),
        example_sentence_th: w.example_sentence_th.trim(),
      }));

      if (onBatchSave) {
        await onBatchSave(payload);
      } else {
        for (const item of payload) {
          await onSave(item);
        }
      }

      setExtractedWords([]);
      setImagePreview(null);
      onClose();
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || 'Failed to import words.');
    } finally {
      setIsSaving(false);
    }
  };

  const posOptions: PartOfSpeech[] = ['noun', 'verb', 'adj', 'adv', 'gerund', 'past_participle', 'other'];
  const selectedPhotoCount = extractedWords.filter((w) => w.selected).length;
  const selectedPromptCount = promptDrafts.filter((w) => w.selected).length;

  const handleCopyThai = () => {
    navigator.clipboard.writeText(wordTh);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const promptSuggestions = [
    { label: '✈️ Airport & Travel (สนามบิน)', prompt: 'Airport and air travel vocabulary with practical examples for junior high students' },
    { label: '💼 Business & Meetings (ธุรกิจ)', prompt: 'Essential business English verbs and phrases for team meetings and discussions' },
    { label: '🌿 Animals & Habitats (สัตว์ป่า)', prompt: 'Wildlife, animal habitats, and environmental ecology vocabulary' },
    { label: '🍳 Restaurant & Food (อาหาร)', prompt: 'Ordering food, restaurant dining, cooking ingredients, and kitchen vocabulary' },
    { label: '🏥 Health & Hospital (การแพทย์)', prompt: 'Common medical terms, symptoms, doctor visits, and healthy living vocabulary' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-text-primary/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl my-auto max-h-[94vh] flex flex-col">
        <Card className="p-4 sm:p-6 shadow-modal border-primary/20 relative flex flex-col flex-1 max-h-[94vh] overflow-hidden bg-white">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-3 pr-8 flex-shrink-0">
            <h2 className="text-lg sm:text-2xl font-outfit font-bold text-text-primary">Add Vocabulary</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Add words by typing, AI Prompt generation, or scanning worksheets with <span className="font-semibold text-primary">คำอ่านภาษาไทย</span>!
            </p>
          </div>

          {/* 3 Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface rounded-2xl border border-border mb-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('type');
                setError(null);
              }}
              className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 text-center ${
                activeTab === 'type'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">Type Word</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('prompt');
                setError(null);
              }}
              className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 text-center ${
                activeTab === 'prompt'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">AI Prompt</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('photo');
                setError(null);
              }}
              className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 text-center ${
                activeTab === 'photo'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">Photo Scan</span>
            </button>
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-xl bg-secondary-light border border-secondary/20 text-xs text-secondary flex items-start gap-2 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: TYPE SINGLE WORD                                          */}
          {/* ================================================================= */}
          {activeTab === 'type' && (
            <form onSubmit={handleSingleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 pb-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      label="English Word / Phrase"
                      placeholder="e.g. reading, bat, play"
                      value={wordEn}
                      onChange={(e) => setWordEn(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleTranslate}
                      isLoading={isTranslating}
                      className="h-11"
                    >
                      <Sparkles className="w-4 h-4 mr-1 text-primary" />
                      Translate
                    </Button>
                  </div>
                </div>

                {/* Duplicate Word Warning Banner */}
                {isSingleWordDuplicate && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      คำว่า <strong className="font-bold font-outfit">"{wordEn.trim()}"</strong> มีอยู่ในชุดคำศัพท์นี้แล้ว
                    </span>
                  </div>
                )}

                {wordEn && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakWord(wordEn)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary hover:bg-primary-light/80 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Pronounce English
                    </button>
                  </div>
                )}

                {/* Thai Phonetic Reading (คำอ่าน) */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Thai Pronunciation / คำอ่านภาษาไทย (เช่น อ่านว่า แบท)
                  </label>
                  <div className="flex rounded-input border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-white transition-all">
                    <span className="inline-flex items-center px-3.5 bg-primary-light text-primary text-sm font-bold font-sarabun border-r border-border/80 flex-shrink-0 select-none">
                      อ่านว่า:
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. แบท, รีดดิ้ง, เพลย์"
                      className="w-full h-11 px-3.5 bg-transparent text-primary font-sarabun text-base font-semibold focus:outline-none placeholder:text-text-muted"
                      value={readingTh}
                      onChange={(e) => setReadingTh(e.target.value)}
                    />
                  </div>
                </div>

                {/* Thai Meaning */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-text-primary">
                      Thai Meaning (ความหมายภาษาไทย)
                    </label>
                    {wordTh && (
                      <button
                        type="button"
                        onClick={handleCopyThai}
                        className="text-xs text-text-secondary hover:text-primary flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="e.g. การอ่านหนังสือ, เล่น"
                    className="font-sarabun text-base"
                    value={wordTh}
                    onChange={(e) => setWordTh(e.target.value)}
                    required
                  />
                </div>

                {/* POS Chips */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Part of Speech (ชนิดของคำ)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {posOptions.map((pos) => (
                      <button
                        type="button"
                        key={pos}
                        onClick={() => setPartOfSpeech(pos)}
                        className={`cursor-pointer transition-transform active:scale-95 ${
                          partOfSpeech === pos ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Badge pos={pos} size="md">
                          {pos}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Example Sentences */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      English Example Sentence
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 rounded-input bg-white border border-border text-text-primary text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="e.g. Reading helps students learn new English words every day."
                      value={exampleEn}
                      onChange={(e) => setExampleEn(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Thai Example Sentence (ประโยคตัวอย่างภาษาไทย)
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 rounded-input bg-white border border-border text-text-primary text-xs font-sarabun focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="e.g. การอ่านช่วยให้นักเรียนได้เรียนรู้คำศัพท์ใหม่ๆ ทุกวัน"
                      value={exampleTh}
                      onChange={(e) => setExampleTh(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (Fixed Footer) */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border mt-3 flex-shrink-0">
                <Button type="button" variant="ghost" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  disabled={isSingleWordDuplicate}
                >
                  Save Word
                </Button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* TAB 2: AI PROMPT GENERATOR                                       */}
          {/* ================================================================= */}
          {activeTab === 'prompt' && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {promptDrafts.length === 0 ? (
                <form
                  onSubmit={handleGeneratePromptVocab}
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 pb-2">
                    {/* Prompt description */}
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-1">
                        Topic or Prompt for AI Vocabulary Generation
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-3 rounded-xl bg-white border border-border text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="e.g. คำศัพท์เกี่ยวกับการเดินทางในสนามบินสำหรับนักเรียน ม.ต้น พร้อมตัวอย่างประโยค หรือ Daily conversation verbs"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    {/* Word Count Selector (Max 50) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-text-primary">
                          Number of Words (จำนวนคำ: 1 - 50 คำ)
                        </label>
                        <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary-light">
                          {aiCount} words
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={aiCount}
                          onChange={(e) => setAiCount(Math.min(Math.max(Number(e.target.value) || 1, 1), 50))}
                          className="w-24 px-3 py-2 text-sm font-bold text-text-primary bg-white rounded-xl border border-border focus:outline-none focus:border-primary text-center"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {[5, 10, 15, 20, 30, 50].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setAiCount(c)}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                aiCount === c
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface text-text-secondary border-border hover:bg-white'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-2">
                        Quick Topic Ideas (กดเลือกเพื่อใส่หัวข้อทันที):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {promptSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAiPrompt(s.prompt)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface border border-border/80 text-text-primary hover:border-primary hover:text-primary transition-colors text-left"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-border mt-3 flex-shrink-0">
                    <Button type="button" variant="ghost" size="md" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isGeneratingPrompt}
                      disabled={!aiPrompt.trim()}
                    >
                      <Wand2 className="w-4 h-4 mr-1.5" />
                      Generate {aiCount} Words
                    </Button>
                  </div>
                </form>
              ) : (
                /* AI Prompt Review List */
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between bg-primary-light/40 p-3 rounded-xl border border-primary/20 mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          AI Generated {promptDrafts.length} Words
                        </p>
                        <p className="text-xs text-text-secondary">
                          {selectedPromptCount} words selected to add to set
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleSelectAllPrompt}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        {promptDrafts.every((w) => w.selected) ? (
                          <>
                            <Square className="w-3.5 h-3.5" /> Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" /> Select All
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPromptDrafts([])}
                        className="text-xs font-semibold text-secondary hover:underline ml-2"
                      >
                        New Prompt
                      </button>
                    </div>
                  </div>

                  {/* Draft Items List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-2">
                    {promptDrafts.map((item, index) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          item.selected
                            ? 'bg-white border-primary/30 shadow-sm'
                            : 'bg-surface/60 border-border opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectPromptWord(item.id)}
                              className="mt-0.5 text-primary flex-shrink-0"
                            >
                              {item.selected ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-text-secondary" />
                              )}
                            </button>

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-text-muted">{index + 1}.</span>
                                <input
                                  type="text"
                                  value={item.word_en}
                                  onChange={(e) =>
                                    handleUpdatePromptDraftWord(item.id, 'word_en', e.target.value)
                                  }
                                  className="font-bold text-sm text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5"
                                />
                                {item.isDuplicate && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    ⚠️ มีแล้วในชุดนี้
                                  </span>
                                )}
                                <Badge pos={item.part_of_speech} size="sm">
                                  {item.part_of_speech}
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => speakWord(item.word_en)}
                                  className="text-text-secondary hover:text-primary transition-colors"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg border border-border/60">
                                  <span className="text-[11px] font-bold text-primary font-sarabun flex-shrink-0">
                                    อ่านว่า:
                                  </span>
                                  <input
                                    type="text"
                                    value={item.reading_th || ''}
                                    placeholder="คำอ่านไทย"
                                    onChange={(e) =>
                                      handleUpdatePromptDraftWord(item.id, 'reading_th', e.target.value)
                                    }
                                    className="text-xs text-primary font-semibold font-sarabun bg-transparent focus:outline-none w-full"
                                  />
                                </div>

                                <input
                                  type="text"
                                  value={item.word_th}
                                  placeholder="ความหมายภาษาไทย"
                                  onChange={(e) =>
                                    handleUpdatePromptDraftWord(item.id, 'word_th', e.target.value)
                                  }
                                  className="text-xs text-text-secondary font-sarabun bg-surface px-2.5 py-1 rounded-lg border border-border/60 focus:outline-none focus:border-primary w-full"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleExpandPromptWord(item.id)}
                              className="p-1 text-text-secondary hover:text-primary rounded-lg"
                              title="Edit example sentences"
                            >
                              {item.isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePromptDraftWord(item.id)}
                              className="p-1 text-secondary/70 hover:text-secondary rounded-lg"
                              title="Remove word"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Example Sentences */}
                        {item.isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/80 space-y-2 text-xs">
                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Part of Speech
                              </label>
                              <select
                                value={item.part_of_speech}
                                onChange={(e) =>
                                  handleUpdatePromptDraftWord(
                                    item.id,
                                    'part_of_speech',
                                    e.target.value as PartOfSpeech
                                  )
                                }
                                className="p-1.5 rounded-lg border border-border bg-white text-xs"
                              >
                                {posOptions.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Example Sentence (EN)
                              </label>
                              <input
                                type="text"
                                value={item.example_sentence_en}
                                onChange={(e) =>
                                  handleUpdatePromptDraftWord(item.id, 'example_sentence_en', e.target.value)
                                }
                                className="w-full p-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-primary"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Example Sentence (TH)
                              </label>
                              <input
                                type="text"
                                value={item.example_sentence_th}
                                onChange={(e) =>
                                  handleUpdatePromptDraftWord(item.id, 'example_sentence_th', e.target.value)
                                }
                                className="w-full p-1.5 rounded-lg border border-border text-xs font-sarabun focus:outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setPromptDrafts([])}
                    >
                      Back to Prompt
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleBatchSavePromptWords}
                      isLoading={isSaving}
                      disabled={selectedPromptCount === 0}
                    >
                      Add {selectedPromptCount} Words to Set
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: PHOTO / WORKSHEET SCAN                                    */}
          {/* ================================================================= */}
          {activeTab === 'photo' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {extractedWords.length === 0 ? (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-primary/30 rounded-card hover:border-primary cursor-pointer bg-primary-light/10 transition-colors p-4">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {imagePreview ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="max-h-44 rounded-lg object-contain" />
                        {isProcessingBatch && (
                          <div className="absolute inset-0 bg-white/90 rounded-lg flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <Sparkles className="w-6 h-6 text-primary animate-spin" />
                            <span className="text-sm font-semibold text-primary">
                              {batchStepMessage || 'Processing image with Multimodal AI Vision...'}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">
                            Take a photo or upload textbook page
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5 max-w-xs mx-auto">
                            Automatically extracts multiple words with <span className="font-semibold text-primary">คำอ่านภาษาไทย</span>!
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                /* Multi-Word Review List */
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-primary-light/40 p-3 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-text-primary">
                            Detected {extractedWords.length} Words
                          </p>
                          {detectedSheetTitle && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-white">
                              {detectedSheetTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary">
                          {selectedPhotoCount} selected for import
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        {extractedWords.every((w) => w.selected) ? (
                          <>
                            <Square className="w-3.5 h-3.5" /> Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" /> Select All
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setExtractedWords([]);
                          setImagePreview(null);
                        }}
                        className="text-xs font-semibold text-secondary hover:underline ml-2"
                      >
                        Scan New Photo
                      </button>
                    </div>
                  </div>

                  {/* Extracted Words Items */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {extractedWords.map((item, index) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          item.selected
                            ? 'bg-white border-primary/30 shadow-sm'
                            : 'bg-surface/60 border-border opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectWord(item.id)}
                              className="mt-0.5 text-primary flex-shrink-0"
                            >
                              {item.selected ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-text-secondary" />
                              )}
                            </button>

                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-text-muted">{index + 1}.</span>
                                <input
                                  type="text"
                                  value={item.word_en}
                                  onChange={(e) =>
                                    handleUpdateDraftWord(item.id, 'word_en', e.target.value)
                                  }
                                  className="font-bold text-sm text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5"
                                />
                                {item.isDuplicate && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    ⚠️ มีแล้วในชุดนี้
                                  </span>
                                )}
                                <Badge pos={item.part_of_speech} size="sm">
                                  {item.part_of_speech}
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => speakWord(item.word_en)}
                                  className="text-text-secondary hover:text-primary transition-colors"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg border border-border/60">
                                  <span className="text-[11px] font-bold text-primary font-sarabun flex-shrink-0">
                                    อ่านว่า:
                                  </span>
                                  <input
                                    type="text"
                                    value={item.reading_th || ''}
                                    placeholder="คำอ่านไทย"
                                    onChange={(e) =>
                                      handleUpdateDraftWord(item.id, 'reading_th', e.target.value)
                                    }
                                    className="text-xs text-primary font-semibold font-sarabun bg-transparent focus:outline-none w-full"
                                  />
                                </div>

                                <input
                                  type="text"
                                  value={item.word_th}
                                  placeholder="ความหมายภาษาไทย"
                                  onChange={(e) =>
                                    handleUpdateDraftWord(item.id, 'word_th', e.target.value)
                                  }
                                  className="text-xs text-text-secondary font-sarabun bg-surface px-2.5 py-1 rounded-lg border border-border/60 focus:outline-none focus:border-primary w-full"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleExpandWord(item.id)}
                              className="p-1 text-text-secondary hover:text-primary rounded-lg"
                              title="Edit example sentences"
                            >
                              {item.isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDraftWord(item.id)}
                              className="p-1 text-secondary/70 hover:text-secondary rounded-lg"
                              title="Remove word"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Example Sentence Details */}
                        {item.isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/80 space-y-2 text-xs">
                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Part of Speech
                              </label>
                              <select
                                value={item.part_of_speech}
                                onChange={(e) =>
                                  handleUpdateDraftWord(
                                    item.id,
                                    'part_of_speech',
                                    e.target.value as PartOfSpeech
                                  )
                                }
                                className="p-1.5 rounded-lg border border-border bg-white text-xs"
                              >
                                {posOptions.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Example Sentence (EN)
                              </label>
                              <input
                                type="text"
                                value={item.example_sentence_en}
                                onChange={(e) =>
                                  handleUpdateDraftWord(item.id, 'example_sentence_en', e.target.value)
                                }
                                className="w-full p-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-primary"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Example Sentence (TH)
                              </label>
                              <input
                                type="text"
                                value={item.example_sentence_th}
                                onChange={(e) =>
                                  handleUpdateDraftWord(item.id, 'example_sentence_th', e.target.value)
                                }
                                className="w-full p-1.5 rounded-lg border border-border text-xs font-sarabun focus:outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setExtractedWords([]);
                        setImagePreview(null);
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleBatchSavePhoto}
                      isLoading={isSaving}
                      disabled={selectedPhotoCount === 0}
                    >
                      Import {selectedPhotoCount} Selected Words
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
