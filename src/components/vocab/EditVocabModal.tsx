import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, Save, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { translateWord } from '../../services/aiService';
import { speakWord } from '../../services/ttsService';
import { getThaiPhonetic } from '../../services/phoneticService';
import type { PartOfSpeech } from '../../types';
import type { Database } from '../../types/database';

type VocabEntry = Database['public']['Tables']['vocab_entries']['Row'];

interface EditVocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: VocabEntry | null;
  onSave: (updatedEntry: {
    id: string;
    word_en: string;
    word_th: string;
    reading_th: string;
    part_of_speech: PartOfSpeech;
    example_sentence_en: string;
    example_sentence_th: string;
  }) => Promise<void>;
}

const POS_OPTIONS: { value: PartOfSpeech; label: string }[] = [
  { value: 'noun', label: 'Noun (คำนาม)' },
  { value: 'verb', label: 'Verb (คำกริยา)' },
  { value: 'adj', label: 'Adjective (คำคุณศัพท์)' },
  { value: 'adv', label: 'Adverb (คำวิเศษณ์)' },
  { value: 'gerund', label: 'Gerund (V.ing)' },
  { value: 'past_participle', label: 'Past Participle (V.3)' },
  { value: 'other', label: 'Other' },
];

export const EditVocabModal: React.FC<EditVocabModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
}) => {
  const [wordEn, setWordEn] = useState('');
  const [wordTh, setWordTh] = useState('');
  const [readingTh, setReadingTh] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleTh, setExampleTh] = useState('');

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setWordEn(entry.word_en);
      setWordTh(entry.word_th);
      const initialReading = entry.audio_url
        ? entry.audio_url.replace(/^reading_th:/, '')
        : getThaiPhonetic(entry.word_en);
      setReadingTh(initialReading);
      setPartOfSpeech(entry.part_of_speech);
      setExampleEn(entry.example_sentence_en || '');
      setExampleTh(entry.example_sentence_th || '');
      setError(null);
    }
  }, [entry, isOpen]);

  if (!isOpen || !entry) return null;

  const handleAiTranslate = async () => {
    if (!wordEn.trim()) {
      setError('Please enter an English word first');
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
      console.error('Translation error:', err);
      setError('AI translation failed. You can edit the fields manually.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordEn.trim() || !wordTh.trim()) {
      setError('Please fill in both the English word and Thai meaning.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        id: entry.id,
        word_en: wordEn.trim(),
        word_th: wordTh.trim(),
        reading_th: readingTh.trim() || getThaiPhonetic(wordEn.trim()),
        part_of_speech: partOfSpeech,
        example_sentence_en: exampleEn.trim(),
        example_sentence_th: exampleTh.trim(),
      });
      onClose();
    } catch (err: unknown) {
      console.error('Error updating word:', err);
      setError('Failed to update vocabulary card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <Card className="w-full max-w-xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-outfit font-bold text-text-primary">
              Edit Vocabulary Card
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              แก้ไขคำศัพท์ คำอ่านภาษาไทย ความหมาย และตัวอย่างประโยค
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* English Word */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">English Word / Phrase</label>
            <div className="flex gap-2">
              <Input
                value={wordEn}
                onChange={(e) => setWordEn(e.target.value)}
                placeholder="e.g. infographic"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => speakWord(wordEn, 'en')}
                disabled={!wordEn.trim()}
                title="Listen to English pronunciation"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                EN
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAiTranslate}
                isLoading={isTranslating}
                title="Auto-fill with Azure OpenAI"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                AI Fill
              </Button>
            </div>
          </div>

          {/* Thai Pronunciation Guide (คำอ่านภาษาไทย) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
              <span>Thai Pronunciation / คำอ่านภาษาไทย (เช่น เมธอด, อินโฟกราฟิก)</span>
            </label>
            <div className="flex rounded-xl border border-border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
              <span className="inline-flex items-center px-3.5 bg-primary-light text-primary font-sarabun font-bold text-xs border-r border-primary/20 select-none">
                อ่านว่า:
              </span>
              <input
                type="text"
                value={readingTh}
                onChange={(e) => setReadingTh(e.target.value)}
                placeholder="เช่น อินโฟกราฟิก, เมธอด, แบท"
                className="w-full px-3.5 py-2.5 bg-transparent font-sarabun text-sm text-text-primary focus:outline-none"
              />
              {readingTh.trim() && (
                <button
                  type="button"
                  onClick={() => speakWord(readingTh, 'th')}
                  className="px-3 text-text-secondary hover:text-primary hover:bg-primary-light transition-colors"
                  title="ฟังเสียงอ่านภาษาไทย"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Thai Meaning */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Thai Meaning (ความหมายภาษาไทย)</label>
            <Input
              value={wordTh}
              onChange={(e) => setWordTh(e.target.value)}
              placeholder="e.g. อินโฟกราฟิก / ภาพข้อมูล"
              required
              className="font-sarabun"
            />
          </div>

          {/* Part of Speech */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Part of Speech</label>
            <select
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            >
              {POS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Example Sentences */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">English Example Sentence</label>
              <textarea
                value={exampleEn}
                onChange={(e) => setExampleEn(e.target.value)}
                placeholder="e.g. The teacher used an infographic to explain the water cycle."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Thai Example Sentence Translation</label>
              <textarea
                value={exampleTh}
                onChange={(e) => setExampleTh(e.target.value)}
                placeholder="e.g. คุณครูใช้อินโฟกราฟิกเพื่ออธิบายวัฏจักรของน้ำ"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-text-primary text-sm font-sarabun focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
