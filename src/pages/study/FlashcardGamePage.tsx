import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Volume2, Check, AlertCircle, X, RotateCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GameHeader } from '../../components/study/GameHeader';
import { speakWord } from '../../services/ttsService';
import { getThaiPhonetic } from '../../services/phoneticService';
import type { VocabSet, VocabEntry } from '../../types';

export const FlashcardGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [set, setSet] = useState<VocabSet | null>(null);
  const [queue, setQueue] = useState<VocabEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Result stats
  const [correctWords, setCorrectWords] = useState<VocabEntry[]>([]);
  const [almostWords, setAlmostWords] = useState<VocabEntry[]>([]);
  const [missedWords, setMissedWords] = useState<VocabEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    const loadSetAndWords = async () => {
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

        // Shuffle deck
        const shuffled = [...entriesData].sort(() => Math.random() - 0.5);
        setSet(setData);
        setQueue(shuffled);
      } catch (err) {
        console.error('Failed to load flashcard deck:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSetAndWords();
  }, [id]);

  // Timer
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const currentCard = queue[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = (rating: 'got_it' | 'almost' | 'missed') => {
    if (!currentCard || !set) return;

    if (rating === 'got_it') {
      setCorrectWords((prev) => [...prev, currentCard]);
    } else if (rating === 'almost') {
      setAlmostWords((prev) => [...prev, currentCard]);
    } else {
      setMissedWords((prev) => [...prev, currentCard]);
      setQueue((prev) => [...prev, currentCard]);
    }

    setIsFlipped(false);

    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const totalUnique = new Set([...correctWords, ...almostWords, ...missedWords, currentCard]).size;
      navigate('/study/results', {
        state: {
          setId: set.id,
          setTitle: set.title,
          gameMode: 'flashcard',
          score: (rating === 'got_it' ? correctWords.length + 1 : correctWords.length),
          total: totalUnique,
          durationSeconds: secondsElapsed,
          correctWords: rating === 'got_it' ? [...correctWords, currentCard] : correctWords,
          almostWords: rating === 'almost' ? [...almostWords, currentCard] : almostWords,
          missedWords: rating === 'missed' ? [...missedWords, currentCard] : missedWords,
        },
      });
    }
  };

  if (isLoading || !set || !currentCard) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-text-secondary">Loading Flashcards...</p>
      </div>
    );
  }

  const phonetic = currentCard.audio_url?.startsWith('reading_th:')
    ? currentCard.audio_url.replace(/^reading_th:/, '')
    : getThaiPhonetic(currentCard.word_en);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-surface via-primary-light/20 to-surface">
      <GameHeader
        setId={set.id}
        setTitle={set.title}
        gameModeTitle="Flashcard Deck"
        currentIndex={currentIndex}
        totalWords={queue.length}
        secondsElapsed={secondsElapsed}
      />

      <div className="w-full max-w-md h-80 sm:h-96 perspective-1000 cursor-pointer" onClick={handleFlip}>
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform shadow-card hover:shadow-card-hover rounded-card ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front (English + Pronunciation Hint) */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-card border-2 border-primary/20 p-8 flex flex-col items-center justify-between backface-hidden">
            <div className="w-full flex items-center justify-between text-xs text-text-secondary font-medium">
              <span className="bg-primary-light text-primary px-2.5 py-1 rounded-full font-semibold">
                {currentCard.part_of_speech}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentCard.word_en);
                }}
                className="p-2 rounded-full text-primary hover:bg-primary-light transition-colors"
                title="Pronounce English word"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-outfit font-bold text-text-primary tracking-tight">
                {currentCard.word_en}
              </h2>
              {/* Thai reading with Audio */}
              <div className="inline-flex items-center gap-1.5 bg-primary-light/80 text-primary font-sarabun px-3 py-1 rounded-full border border-primary/20">
                <span className="text-sm font-semibold">อ่านว่า: {phonetic}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(phonetic, 'th');
                  }}
                  className="p-1 rounded-full hover:bg-primary/20 transition-colors"
                  title="ฟังเสียงอ่านภาษาไทย"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap to flip card</span>
            </div>
          </div>

          {/* Card Back (Thai Meaning & Examples) */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-light/50 to-white rounded-card border-2 border-primary p-8 flex flex-col items-center justify-between rotate-y-180 backface-hidden">
            <div className="w-full flex items-center justify-between text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{currentCard.word_en}</span>
                <span className="font-sarabun text-text-secondary">({phonetic})</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentCard.word_en);
                }}
                className="p-2 rounded-full text-primary hover:bg-primary-light transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-sarabun font-bold text-primary">
                {currentCard.word_th}
              </h2>
              {currentCard.example_sentence_en && (
                <div className="p-3 rounded-xl bg-white/80 border border-primary/10 text-xs text-text-secondary text-left space-y-1">
                  <p className="italic">"{currentCard.example_sentence_en}"</p>
                  {currentCard.example_sentence_th && (
                    <p className="font-sarabun text-text-muted">{currentCard.example_sentence_th}</p>
                  )}
                </div>
              )}
            </div>

            <span className="text-xs text-text-muted">Rate your recall below</span>
          </div>
        </div>
      </div>

      {/* Self-Rating Action Buttons */}
      <div className="w-full max-w-md mt-6">
        {isFlipped ? (
          <div className="grid grid-cols-3 gap-3 animate-fade-in">
            <button
              type="button"
              onClick={() => handleRating('missed')}
              className="h-14 rounded-btn bg-[#FF6B6B] hover:bg-[#E85B5B] text-white font-semibold text-sm flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
              <span>✗ Missed</span>
            </button>

            <button
              type="button"
              onClick={() => handleRating('almost')}
              className="h-14 rounded-btn bg-[#FFD166] hover:bg-[#FFD166]/90 text-text-primary font-semibold text-sm flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-all"
            >
              <AlertCircle className="w-4 h-4" />
              <span>≈ Almost</span>
            </button>

            <button
              type="button"
              onClick={() => handleRating('got_it')}
              className="h-14 rounded-btn bg-[#06D6A0] hover:bg-[#059669] text-white font-semibold text-sm flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>✓ Got it</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFlip}
            className="w-full h-14 rounded-btn bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-primary-btn active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Show Meaning (Flip Card)
          </button>
        )}
      </div>
    </div>
  );
};
