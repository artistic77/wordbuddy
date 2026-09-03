import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Volume2, Check, X, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GameHeader } from '../../components/study/GameHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { speakWord } from '../../services/ttsService';
import type { VocabSet, VocabEntry } from '../../types';

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export const MultipleChoiceGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const scope = searchParams.get('scope');
  const navigate = useNavigate();

  const [set, setSet] = useState<VocabSet | null>(null);
  const [allEntries, setAllEntries] = useState<VocabEntry[]>([]);
  const [questions, setQuestions] = useState<VocabEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Result stats
  const [correctWords, setCorrectWords] = useState<VocabEntry[]>([]);
  const [missedWords, setMissedWords] = useState<VocabEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
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
        setAllEntries(entriesData);
        setQuestions(shuffled);
      } catch (err) {
        console.error('Failed to load multiple choice game:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const currentQuestion = questions[currentIndex];

  // Generate 4 options (1 correct + 3 random distractors)
  useEffect(() => {
    if (!currentQuestion || allEntries.length === 0) return;

    const correct = { text: currentQuestion.word_th, isCorrect: true };
    const distractors = allEntries
      .filter((e) => e.id !== currentQuestion.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((e) => ({ text: e.word_th, isCorrect: false }));

    // If there are fewer than 3 distractors in this set, generate standard fallback distractors
    const standardDistractors = [
      'ความสุข',
      'การเดินทาง',
      'ความพยายาม',
      'ชัยชนะ',
      'ความท้าทาย',
      'มิตรภาพ',
    ];
    while (distractors.length < 3) {
      const fallback = standardDistractors[Math.floor(Math.random() * standardDistractors.length)];
      if (!distractors.some((d) => d.text === fallback) && fallback !== correct.text) {
        distractors.push({ text: fallback, isCorrect: false });
      }
    }

    const mixed = [correct, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(mixed);
    setSelectedOption(null);
  }, [currentIndex, currentQuestion, allEntries]);

  // Timer
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSelectOption = (opt: QuestionOption) => {
    if (selectedOption !== null || !currentQuestion) return;

    setSelectedOption(opt);
    if (opt.isCorrect) {
      setCorrectWords((prev) => [...prev, currentQuestion]);
    } else {
      setMissedWords((prev) => [...prev, currentQuestion]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Game Finished!
      navigate('/study/results', {
        state: {
          setId: set!.id,
          setTitle: set!.title,
          gameMode: 'multiple_choice',
          score: correctWords.length,
          total: questions.length,
          durationSeconds: secondsElapsed,
          correctWords,
          almostWords: [],
          missedWords,
        },
      });
    }
  };

  if (isLoading || !set || !currentQuestion) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-text-secondary">Loading Multiple Choice Game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-surface via-primary-light/20 to-surface">
      <GameHeader
        setId={set.id}
        setTitle={set.title}
        gameModeTitle="Multiple Choice"
        currentIndex={currentIndex}
        totalWords={questions.length}
        secondsElapsed={secondsElapsed}
      />

      <div className="w-full max-w-xl space-y-6">
        {/* Question Card */}
        <Card className="p-6 sm:p-8 shadow-card border-primary/20 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            What is the Thai meaning of:
          </p>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl sm:text-4xl font-outfit font-bold text-primary">
              {currentQuestion.word_en}
            </h2>
            <button
              type="button"
              onClick={() => speakWord(currentQuestion.word_en)}
              className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-primary hover:bg-primary-light transition-colors"
              title="Pronounce word"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-light text-primary">
            {currentQuestion.part_of_speech}
          </span>
        </Card>

        {/* 4 Option Buttons (2-col grid on tablets) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {options.map((opt, i) => {
            let buttonStyle = 'bg-white border-border text-text-primary hover:border-primary/50 hover:bg-surface';

            if (selectedOption !== null) {
              if (opt.isCorrect) {
                buttonStyle = 'bg-accent-green text-white border-accent-green shadow-sm';
              } else if (selectedOption.text === opt.text && !opt.isCorrect) {
                buttonStyle = 'bg-secondary text-white border-secondary animate-shake';
              } else {
                buttonStyle = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
              }
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={selectedOption !== null}
                className={`w-full min-h-[58px] px-4 py-3 rounded-card border-2 font-sarabun text-base sm:text-lg font-semibold flex items-center justify-between transition-all active:scale-[0.99] ${buttonStyle}`}
              >
                <span className="text-left break-words">{opt.text}</span>
                {selectedOption !== null && (
                  <div className="flex-shrink-0 ml-2">
                    {opt.isCorrect && <Check className="w-5 h-5" />}
                    {selectedOption.text === opt.text && !opt.isCorrect && <X className="w-5 h-5" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {selectedOption !== null && (
          <div className="animate-fade-in pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 h-14"
            >
              {currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
