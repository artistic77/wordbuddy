import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Volume2, RotateCcw, Check, X, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GameHeader } from '../../components/study/GameHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { speakWord } from '../../services/ttsService';
import { getThaiPhonetic } from '../../services/phoneticService';
import type { VocabSet, VocabEntry } from '../../types';

export const SpellingGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const scope = searchParams.get('scope');
  const navigate = useNavigate();

  const [set, setSet] = useState<VocabSet | null>(null);
  const [words, setWords] = useState<VocabEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Answer status: null | 'correct' | 'wrong'
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

  // Result stats
  const [correctWords, setCorrectWords] = useState<VocabEntry[]>([]);
  const [missedWords, setMissedWords] = useState<VocabEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    const loadSet = async () => {
      setIsLoading(true);
      try {
        const { data: setData } = await supabase.from('vocab_sets').select('*').eq('id', id).single();
        const { data: entriesData } = await supabase
          .from('vocab_entries')
          .select('*')
          .eq('set_id', id);

        if (!setData || !entriesData || entriesData.length === 0) {
          navigate(`/sets/${id}`);
          return;
        }

        let wordsToStudy = entriesData;
        if (scope === 'unmastered') {
          const unmastered = wordsToStudy.filter((e) => !e.is_mastered);
          if (unmastered.length > 0) {
            wordsToStudy = unmastered;
          }
        }

        const shuffled = [...wordsToStudy].sort(() => Math.random() - 0.5);
        setSet(setData);
        setWords(shuffled);
      } catch (err) {
        console.error('Failed to load spelling game:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSet();
  }, [id]);

  const currentWord = words[currentIndex];

  // Auto-play audio when question changes
  useEffect(() => {
    if (currentWord && !isLoading) {
      speakWord(currentWord.word_en);
    }
  }, [currentIndex, currentWord, isLoading]);

  // Timer
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || answerStatus !== null || !currentWord) return;

    const isCorrect = userInput.trim().toLowerCase() === currentWord.word_en.trim().toLowerCase();

    if (isCorrect) {
      setAnswerStatus('correct');
      setCorrectWords((prev) => [...prev, currentWord]);
    } else {
      setAnswerStatus('wrong');
      setMissedWords((prev) => [...prev, currentWord]);
    }
  };

  const handleNext = () => {
    setAnswerStatus(null);
    setUserInput('');

    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate('/study/results', {
        state: {
          setId: set!.id,
          setTitle: set!.title,
          gameMode: 'spelling',
          score: correctWords.length + (answerStatus === 'correct' ? 0 : 0),
          total: words.length,
          durationSeconds: secondsElapsed,
          correctWords,
          almostWords: [],
          missedWords,
        },
      });
    }
  };

  if (isLoading || !set || !currentWord) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-text-secondary">Loading Spelling Game...</p>
      </div>
    );
  }

  const phonetic = currentWord.audio_url?.startsWith('reading_th:')
    ? currentWord.audio_url.replace(/^reading_th:/, '')
    : getThaiPhonetic(currentWord.word_en);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 pt-4 sm:pt-8 overflow-y-auto bg-gradient-to-b from-surface via-primary-light/20 to-surface">
      <GameHeader
        setId={set.id}
        setTitle={set.title}
        gameModeTitle="Spelling Game"
        currentIndex={currentIndex}
        totalWords={words.length}
        secondsElapsed={secondsElapsed}
      />

      <div className="w-full max-w-xl">
        <Card className="p-6 sm:p-10 shadow-modal border-primary/20 text-center space-y-5 sm:space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-outfit font-bold text-text-primary">
              Listen & Spell 🎧
            </h2>
            <p className="text-xs text-text-secondary">
              Type the exact English word you hear aloud.
            </p>
          </div>

          {/* Speaker Play Button (responsive for iPad keyboard) */}
          <div className="py-1 sm:py-2 flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={() => speakWord(currentWord.word_en)}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-primary-btn hover:scale-105 active:scale-95 transition-all"
              title="Play audio"
            >
              <Volume2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            <button
              type="button"
              onClick={() => speakWord(currentWord.word_en)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline p-1 min-h-[32px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay Audio
            </button>
          </div>

          {/* Thai Phonetic & Meaning Hints */}
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs text-text-secondary space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold text-primary font-sarabun bg-primary-light px-2.5 py-0.5 rounded-full text-xs">
                อ่านว่า: {phonetic}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary font-semibold">
                {currentWord.part_of_speech}
              </span>
            </div>
            <p className="font-sarabun text-text-primary font-medium text-sm pt-1">
              แปลว่า: {currentWord.word_th}
            </p>
          </div>

          {/* Spelling Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Type the English word..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={answerStatus !== null}
              className={`w-full h-14 text-center text-xl font-outfit font-bold rounded-input border-2 transition-all focus:outline-none ${
                answerStatus === 'correct'
                  ? 'border-accent-green bg-accent-green-light text-accent-emerald'
                  : answerStatus === 'wrong'
                  ? 'border-secondary bg-secondary-light text-secondary animate-shake'
                  : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="send"
            />

            {/* Feedback states */}
            {answerStatus === 'correct' && (
              <div className="p-3.5 rounded-xl bg-accent-green-light border border-accent-green/20 text-accent-emerald font-semibold text-sm flex items-center justify-center gap-2 animate-fade-in">
                <Check className="w-5 h-5" />
                Correct! Excellent spelling ({currentWord.word_en} อ่านว่า {phonetic})
              </div>
            )}

            {answerStatus === 'wrong' && (
              <div className="p-3.5 rounded-xl bg-secondary-light border border-secondary/20 text-secondary text-sm space-y-1 animate-fade-in">
                <div className="flex items-center justify-center gap-1.5 font-semibold">
                  <X className="w-5 h-5" />
                  Not quite right!
                </div>
                <p className="text-xs">
                  The word was:{' '}
                  <span className="font-bold underline text-text-primary">{currentWord.word_en}</span>{' '}
                  <span className="font-sarabun text-primary font-semibold">(อ่านว่า: {phonetic})</span>
                </p>
              </div>
            )}

            {answerStatus === null ? (
              <Button type="submit" variant="primary" size="lg" className="w-full h-14 text-base">
                Submit Answer
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 h-14 text-base"
              >
                {currentIndex + 1 < words.length ? 'Next Word' : 'See Results'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};
