import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  XCircle,
  Flame,
  Trophy,
  RotateCcw,
  Send,
  Eye,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { speakWord } from '../../services/ttsService';
import { getThaiPhonetic } from '../../services/phoneticService';
import type { VocabSet, VocabEntry } from '../../types';

export const FillBlankGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [set, setSet] = useState<VocabSet | null>(null);
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and shuffle words
  const initGame = useCallback((rawEntries: VocabEntry[]) => {
    if (rawEntries.length === 0) return;
    // Filter words that have valid example sentences, fallback to all if none
    const valid = rawEntries.filter((e) => Boolean(e.example_sentence_en?.trim()));
    const deck = (valid.length >= 3 ? valid : rawEntries).sort(() => Math.random() - 0.5);

    setEntries(deck);
    setCurrentIndex(0);
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setIsCompleted(false);
  }, []);

  // Fetch set
  useEffect(() => {
    if (!id) return;
    const loadSet = async () => {
      setIsLoading(true);
      try {
        const { data: setData, error: setErr } = await supabase
          .from('vocab_sets')
          .select('*')
          .eq('id', id)
          .single();
        if (setErr) throw setErr;
        setSet(setData);

        const { data: entriesData, error: entriesErr } = await supabase
          .from('vocab_entries')
          .select('*')
          .eq('set_id', id);
        if (entriesErr) throw entriesErr;

        if (entriesData && entriesData.length > 0) {
          initGame(entriesData);
        }
      } catch (err) {
        console.error('Error loading fill in blank game:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSet();
  }, [id, initGame]);

  const currentEntry = entries[currentIndex];

  // Helper to generate masked sentence
  const getMaskedSentence = (entry: VocabEntry) => {
    if (!entry.example_sentence_en) {
      return `The word "${entry.word_th}" in English is: ________.`;
    }
    const escapedWord = entry.word_en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    return entry.example_sentence_en.replace(regex, '________');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentEntry || isAnswered || !userInput.trim()) return;

    const cleanInput = userInput.trim().toLowerCase();
    const targetWord = currentEntry.word_en.trim().toLowerCase();
    const correct = cleanInput === targetWord;

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const points = 100 + (newCombo - 1) * 20;
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      speakWord(currentEntry.word_en, 'en');
    } else {
      setCombo(0);
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 < entries.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      // Game completed!
      setIsCompleted(true);
      if (user && id) {
        try {
          await supabase.from('study_sessions').insert({
            user_id: user.id,
            set_id: id,
            game_mode: 'fill_blank',
            score: score,
            total: entries.length,
            duration_seconds: 60,
          });
        } catch (err) {
          console.error('Error recording session:', err);
        }
      }
    }
  };

  if (isLoading || !set) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary">Loading Fill in the Blank Game...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-outfit text-text-primary">No Words Available</h2>
        <p className="text-sm text-text-secondary">
          Add some vocabulary words to this set before starting the game.
        </p>
        <Link to={`/sets/${set.id}`}>
          <Button variant="primary" size="md">
            Back to Set
          </Button>
        </Link>
      </div>
    );
  }

  const phonetic = currentEntry.audio_url
    ? currentEntry.audio_url.replace(/^reading_th:/, '')
    : getThaiPhonetic(currentEntry.word_en);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/sets/${set.id}`}
            className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-elevated transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="verb" size="sm">
                ✍️ Fill in the Blank
              </Badge>
              <span className="text-xs text-text-muted">
                Word {currentIndex + 1} of {entries.length}
              </span>
            </div>
            <h1 className="text-xl font-outfit font-bold text-text-primary">{set.title}</h1>
          </div>
        </div>

        {/* Score & Combo */}
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-accent-yellow-light text-accent-yellow rounded-xl border border-accent-yellow/30 text-sm font-bold animate-bounce">
              <Flame className="w-4 h-4 fill-accent-yellow" />
              <span>{combo}x Combo!</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary rounded-xl border border-primary/20 text-sm font-bold">
            <Trophy className="w-4 h-4" />
            <span>{score} pts</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-elevated h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / entries.length) * 100}%` }}
        />
      </div>

      {!isCompleted ? (
        <Card className="p-6 sm:p-10 space-y-8 shadow-card border-primary/20">
          {/* Question Sentence Box */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Badge pos={currentEntry.part_of_speech} size="md">
                Hint POS: {currentEntry.part_of_speech}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-light text-primary font-sarabun border border-primary/20">
                อ่านว่า: {phonetic}
                <button
                  type="button"
                  onClick={() => speakWord(phonetic, 'th')}
                  className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                  title="ฟังเสียงอ่านภาษาไทย"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>

            {/* Masked English Sentence */}
            <div className="p-6 bg-surface-elevated/70 rounded-2xl border border-border space-y-3">
              <p className="text-xl sm:text-2xl font-outfit font-semibold text-text-primary leading-relaxed">
                "{getMaskedSentence(currentEntry)}"
              </p>

              {/* Thai Meaning Hint Toggle */}
              {currentEntry.example_sentence_th && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm font-sarabun text-text-secondary">
                    <span className="font-semibold text-text-muted">ความหมายประโยค: </span>
                    {currentEntry.example_sentence_th}
                  </p>
                </div>
              )}
            </div>

            {/* Hint Button */}
            {!showHint && !isAnswered && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show Thai meaning hint ({currentEntry.word_th})</span>
              </button>
            )}

            {showHint && !isAnswered && (
              <p className="text-sm font-sarabun text-primary font-medium animate-fade-in">
                คำแปล: <span className="font-bold">{currentEntry.word_th}</span>
              </p>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isAnswered}
                  placeholder="Type the missing English word..."
                  autoFocus
                  className={`w-full px-5 py-3.5 rounded-2xl border-2 font-outfit text-lg text-center tracking-wide focus:outline-none transition-all shadow-sm ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-green-50 border-accent-green text-green-800'
                        : 'bg-red-50 border-red-400 text-red-800'
                      : 'border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white'
                  }`}
                />
              </div>
            </div>

            {!isAnswered ? (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-base py-3.5 shadow-primary-btn"
                disabled={!userInput.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Check Answer
              </Button>
            ) : (
              /* Answer Feedback */
              <div className="space-y-4 animate-fade-in">
                <div
                  className={`p-4 rounded-2xl flex items-center justify-between gap-3 border ${
                    isCorrect
                      ? 'bg-accent-green-light/60 border-accent-green text-green-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-7 h-7 text-accent-green flex-shrink-0" />
                    ) : (
                      <XCircle className="w-7 h-7 text-red-500 flex-shrink-0" />
                    )}
                    <div className="text-left">
                      <p className="font-bold text-sm">
                        {isCorrect ? 'Correct! Well done! 🎉' : 'Incorrect'}
                      </p>
                      <p className="text-xs">
                        The correct word is:{' '}
                        <span className="font-bold underline text-sm">
                          {currentEntry.word_en}
                        </span>{' '}
                        ({currentEntry.word_th})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakWord(currentEntry.word_en, 'en')}
                    className="p-2 rounded-xl bg-white text-primary hover:bg-primary-light shadow-sm transition-colors flex-shrink-0"
                    title="Listen pronunciation"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  className="w-full text-base py-3.5"
                >
                  {currentIndex + 1 < entries.length ? 'Next Word →' : 'View Summary 🏆'}
                </Button>
              </div>
            )}
          </form>
        </Card>
      ) : (
        /* Summary Screen */
        <Card className="p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto shadow-2xl animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent-green-light flex items-center justify-center text-accent-green">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-outfit font-bold text-text-primary">
              Quiz Completed! 🌟
            </h2>
            <p className="text-sm text-text-secondary">
              You scored <span className="font-bold text-primary">{correctCount}</span> out of{' '}
              <span className="font-bold">{entries.length}</span> correct!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-surface rounded-2xl border border-border">
            <div>
              <p className="text-xs text-text-secondary">Total Score</p>
              <p className="text-xl font-outfit font-bold text-primary">{score}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Accuracy</p>
              <p className="text-xl font-outfit font-bold text-accent-green">
                {Math.round((correctCount / entries.length) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Max Combo</p>
              <p className="text-xl font-outfit font-bold text-accent-yellow">🔥 {maxCombo}x</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
            <Button variant="secondary" size="md" onClick={() => initGame(entries)}>
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Try Again
            </Button>
            <Link to={`/sets/${set.id}`}>
              <Button variant="primary" size="md">
                Back to Set Detail
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
