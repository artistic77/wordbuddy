import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { translateWord, extractMultipleWordsFromImage, batchTranslateWords } from '../../services/aiService';
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
}

interface AddVocabModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onSave,
  onBatchSave,
}) => {
  const [activeTab, setActiveTab] = useState<'type' | 'photo'>('type');

  // Single word form state
  const [wordEn, setWordEn] = useState('');
  const [wordTh, setWordTh] = useState('');
  const [readingTh, setReadingTh] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleTh, setExampleTh] = useState('');

  // Batch Multi-Word OCR state
  const [extractedWords, setExtractedWords] = useState<VocabEntryDraft[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchStepMessage, setBatchStepMessage] = useState<string | null>(null);

  // UI state
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setIsProcessingBatch(true);
      setBatchStepMessage('Scanning photo & extracting words with OCR.Space...');

      try {
        // 1. Extract multiple words
        const rawWords = await extractMultipleWordsFromImage(base64, file.type);

        if (!rawWords || rawWords.length === 0) {
          setError('No clear English vocabulary words found in this image. Please try another photo.');
          setIsProcessingBatch(false);
          return;
        }

        setBatchStepMessage(`Found ${rawWords.length} words! Generating Thai meanings & phonetic guides...`);

        // 2. Batch translate all extracted words
        const translations: TranslationResponse[] = await batchTranslateWords(rawWords);

        // 3. Populate batch draft list
        const drafts: VocabEntryDraft[] = translations.map((t, idx) => ({
          id: `draft-${idx}-${Date.now()}`,
          word_en: t.word_en,
          word_th: t.word_th,
          reading_th: t.reading_th || '',
          part_of_speech: t.part_of_speech,
          example_sentence_en: t.example_sentence_en,
          example_sentence_th: t.example_sentence_th,
          selected: true,
          isExpanded: false,
        }));

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

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        word_en: wordEn.trim(),
        word_th: wordTh.trim(),
        reading_th: readingTh.trim(),
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

  // Batch multi-word save
  const handleBatchSave = async () => {
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
        reading_th: w.reading_th?.trim(),
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
  const selectedCount = extractedWords.filter((w) => w.selected).length;

  const handleCopyThai = () => {
    navigator.clipboard.writeText(wordTh);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl my-8 max-h-[90vh] flex flex-col">
        <Card className="p-6 sm:p-8 shadow-modal border-primary/20 relative flex flex-col flex-1 overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-outfit font-bold text-text-primary">Add Vocabulary</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Add individual words or snap a photo with automatic <span className="font-semibold text-primary">คำอ่านภาษาไทย</span> guides!
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-surface rounded-2xl border border-border mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('type')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'type'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Type Single Word
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'photo'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Camera className="w-4 h-4" />
              Photo / Multi-Word Scan
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-secondary-light border border-secondary/20 text-xs text-secondary">
              {error}
            </div>
          )}

          {activeTab === 'photo' ? (
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
                              {batchStepMessage || 'Processing image with OCR.Space & Azure Translator...'}
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
                      <Layers className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          Detected {extractedWords.length} Words
                        </p>
                        <p className="text-xs text-text-secondary">
                          {selectedCount} selected for import
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
                                  className="font-outfit font-bold text-base text-primary bg-transparent border-b border-transparent hover:border-primary/40 focus:border-primary focus:outline-none px-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => speakWord(item.word_en)}
                                  className="text-text-secondary hover:text-primary"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <Badge pos={item.part_of_speech} size="sm">
                                  {item.part_of_speech}
                                </Badge>
                              </div>

                              {/* Reading Guide + Thai Meaning */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-primary font-sarabun bg-primary-light px-2 py-0.5 rounded-md">
                                  อ่านว่า:
                                </span>
                                <input
                                  type="text"
                                  value={item.reading_th || ''}
                                  onChange={(e) =>
                                    handleUpdateDraftWord(item.id, 'reading_th', e.target.value)
                                  }
                                  placeholder="คำอ่าน (e.g. แบท)"
                                  className="text-xs font-sarabun font-semibold text-primary bg-transparent border-b border-transparent hover:border-primary/40 focus:border-primary focus:outline-none px-1 w-28"
                                />
                                <input
                                  type="text"
                                  value={item.word_th}
                                  onChange={(e) =>
                                    handleUpdateDraftWord(item.id, 'word_th', e.target.value)
                                  }
                                  placeholder="คำแปลภาษาไทย"
                                  className="text-xs font-sarabun text-text-primary bg-transparent border-b border-transparent hover:border-primary/40 focus:border-primary focus:outline-none px-1 flex-1"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleExpandWord(item.id)}
                              className="p-1 text-text-secondary hover:text-primary"
                              title="Expand/Edit details"
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
                              className="p-1 text-text-secondary hover:text-secondary"
                              title="Remove word"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {item.isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs animate-fade-in">
                            <div>
                              <label className="font-semibold text-text-secondary block mb-1">
                                Part of Speech
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {posOptions.map((p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => handleUpdateDraftWord(item.id, 'part_of_speech', p)}
                                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                                      item.part_of_speech === p
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-surface text-text-secondary border-border'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
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

                  <div className="flex items-center justify-between pt-3 border-t border-border">
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
                      onClick={handleBatchSave}
                      isLoading={isSaving}
                      disabled={selectedCount === 0}
                    >
                      Import {selectedCount} Selected Words
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Single Word Typing Form */
            <form onSubmit={handleSingleSave} className="space-y-4">
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
                  {readingTh && (
                    <button
                      type="button"
                      onClick={() => speakWord(readingTh, 'th')}
                      className="px-3 text-text-secondary hover:text-primary transition-colors border-l border-border/80 flex items-center"
                      title="ฟังเสียงอ่านภาษาไทย"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
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
              <div className="space-y-3 pt-2">
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

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghost" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                  Save Word
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
