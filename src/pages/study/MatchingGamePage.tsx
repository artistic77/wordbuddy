import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Timer,
  Trophy,
  Flame,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { speakWord } from '../../services/ttsService';
import { getThaiPhonetic } from '../../services/phoneticService';
import type { VocabSet, VocabEntry } from '../../types';

interface MatchTile {
  id: string; // unique tile id: "en-1" or "th-1"
  entryId: string;
  type: 'en' | 'th';
  text: string;
  readingTh?: string;
  isMatched: boolean;
}

export const MatchingGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const scope = searchParams.get('scope');
  const { user } = useAuth();

  const [set, setSet] = useState<VocabSet | null>(null);
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [tiles, setTiles] = useState<MatchTile[]>([]);
  const [selectedTile, setSelectedTile] = useState<MatchTile | null>(null);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<number | null>(null);

  // Initialize and shuffle game tiles
  const initGame = useCallback((rawEntries: VocabEntry[]) => {
    if (rawEntries.length === 0) return;

    // Pick up to 8 random words per round for optimal matching gameplay
    const shuffledWords = [...rawEntries].sort(() => Math.random() - 0.5).slice(0, 8);

    const enTiles: MatchTile[] = shuffledWords.map((w) => ({
      id: `en-${w.id}`,
      entryId: w.id,
      type: 'en',
      text: w.word_en,
      isMatched: false,
    }));

    const thTiles: MatchTile[] = shuffledWords.map((w) => {
      const phonetic = w.audio_url
        ? w.audio_url.replace(/^reading_th:/, '')
        : getThaiPhonetic(w.word_en);
      return {
        id: `th-${w.id}`,
        entryId: w.id,
        type: 'th',
        text: w.word_th,
        readingTh: phonetic,
        isMatched: false,
      };
    });

    // Shuffle both sets independently into one deck
    const allTiles = [...enTiles, ...thTiles].sort(() => Math.random() - 0.5);

    setTiles(allTiles);
    setSelectedTile(null);
    setWrongPair([]);
    setMatchedPairsCount(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMistakes(0);
    setElapsedSeconds(0);
    setIsPlaying(true);
    setIsCompleted(false);
  }, []);

  // Fetch set and words
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
          let wordsToStudy = entriesData;
          if (scope === 'unmastered') {
            const unmastered = wordsToStudy.filter((e) => !e.is_mastered);
            if (unmastered.length > 0) {
              wordsToStudy = unmastered;
            }
          }
          setEntries(wordsToStudy);
          initGame(wordsToStudy);
        }
      } catch (err) {
        console.error('Error loading game:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSet();
  }, [id, initGame]);

  // Timer tick
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isCompleted]);

  // Save score to study_sessions on complete
  const handleGameComplete = useCallback(
    async (finalScore: number, finalTotal: number, duration: number) => {
      if (!user || !id) return;
      try {
        await supabase.from('study_sessions').insert({
          user_id: user.id,
          set_id: id,
          game_mode: 'matching',
          score: finalScore,
          total: finalTotal,
          duration_seconds: duration,
        });
      } catch (err) {
        console.error('Error saving study session:', err);
      }
    },
    [user, id]
  );

  const handleTileClick = (tile: MatchTile) => {
    if (!isPlaying || tile.isMatched || wrongPair.length > 0) return;

    // If tapping the already selected tile, deselect it
    if (selectedTile?.id === tile.id) {
      setSelectedTile(null);
      return;
    }

    // Play pronunciation if EN
    if (tile.type === 'en') {
      speakWord(tile.text, 'en');
    }

    // First tile selection
    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    // Second tile selected - Cannot pair two tiles of the same type (e.g. EN and EN)
    if (selectedTile.type === tile.type) {
      setSelectedTile(tile);
      return;
    }

    // Check Match
    const isMatch = selectedTile.entryId === tile.entryId;

    if (isMatch) {
      // ✅ Correct Match!
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const basePoints = 100;
      const comboBonus = (newCombo - 1) * 25;
      const totalPoints = basePoints + comboBonus;
      setScore((prev) => prev + totalPoints);

      const nextMatchedCount = matchedPairsCount + 1;
      setMatchedPairsCount(nextMatchedCount);

      setTiles((prev) =>
        prev.map((t) =>
          t.id === selectedTile.id || t.id === tile.id ? { ...t, isMatched: true } : t
        )
      );
      setSelectedTile(null);

      // Check if all pairs are matched
      const totalPairs = tiles.length / 2;
      if (nextMatchedCount >= totalPairs) {
        setIsCompleted(true);
        setIsPlaying(false);
        handleGameComplete(score + totalPoints, totalPairs, elapsedSeconds);
      }
    } else {
      // ❌ Wrong Match
      setCombo(0);
      setMistakes((prev) => prev + 1);
      setWrongPair([selectedTile.id, tile.id]);

      setTimeout(() => {
        setWrongPair([]);
        setSelectedTile(null);
      }, 700);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading || !set) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary">Loading Matching Game...</p>
      </div>
    );
  }

  if (entries.length < 2) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-outfit text-text-primary">Need more words</h2>
        <p className="text-sm text-text-secondary">
          You need at least 2 vocabulary words in this set to play the Word Matching Game.
        </p>
        <Link to={`/sets/${set.id}`}>
          <Button variant="primary" size="md">
            Back to Set Detail
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
      {/* Header Bar */}
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
              <Badge variant="noun" size="sm">
                🧩 Word Matching
              </Badge>
              <span className="text-xs text-text-muted">
                {matchedPairsCount} / {tiles.length / 2} Pairs
              </span>
            </div>
            <h1 className="text-xl font-outfit font-bold text-text-primary">{set.title}</h1>
          </div>
        </div>

        {/* Stats Pill Row */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-xl border border-border text-sm font-semibold text-text-secondary">
            <Timer className="w-4 h-4 text-primary" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Combo */}
          {combo > 1 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-accent-yellow-light text-accent-yellow rounded-xl border border-accent-yellow/30 text-sm font-bold animate-bounce">
              <Flame className="w-4 h-4 fill-accent-yellow" />
              <span>{combo}x Combo!</span>
            </div>
          )}

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary rounded-xl border border-primary/20 text-sm font-bold">
            <Trophy className="w-4 h-4" />
            <span>{score} pts</span>
          </div>
        </div>
      </div>

      {/* Main Game Board */}
      {!isCompleted ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-surface-elevated h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-accent-green h-full transition-all duration-300 rounded-full"
              style={{
                width: `${tiles.length ? (matchedPairsCount / (tiles.length / 2)) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Grid of Word & Meaning Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {tiles.map((tile) => {
              const isSelected = selectedTile?.id === tile.id;
              const isWrong = wrongPair.includes(tile.id);
              const isMatched = tile.isMatched;

              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => handleTileClick(tile)}
                  disabled={isMatched}
                  className={`min-h-[105px] sm:min-h-[120px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center relative select-none ${
                    isMatched
                      ? 'opacity-0 scale-95 pointer-events-none'
                      : isWrong
                      ? 'bg-red-50 border-red-400 text-red-700 animate-shake shadow-md'
                      : isSelected
                      ? 'bg-primary-light border-primary text-primary shadow-primary-btn scale-105 ring-2 ring-primary/30'
                      : 'bg-white border-border hover:border-primary/50 text-text-primary hover:shadow-card active:scale-95'
                  }`}
                >
                  {/* Type Badge */}
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      tile.type === 'en'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent-green/10 text-accent-green'
                    }`}
                  >
                    {tile.type === 'en' ? 'EN' : 'TH'}
                  </span>

                  {/* Tile Text */}
                  <span
                    className={`font-bold break-words hyphens-auto px-1 ${
                      tile.type === 'en'
                        ? 'font-outfit text-sm sm:text-base md:text-lg text-primary'
                        : 'font-sarabun text-xs sm:text-sm md:text-base text-text-primary'
                    }`}
                  >
                    {tile.text}
                  </span>

                  {/* Thai Phonetic Guide if available */}
                  {tile.readingTh && (
                    <span className="text-[11px] font-sarabun text-text-muted mt-1">
                      ({tile.readingTh})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Completed Summary Screen */
        <Card className="p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto shadow-2xl animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent-green-light flex items-center justify-center text-accent-green">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-outfit font-bold text-text-primary">
              Awesome Work! 🌟
            </h2>
            <p className="text-sm text-text-secondary">
              You matched all {tiles.length / 2} pairs in{' '}
              <span className="font-bold text-primary">{formatTime(elapsedSeconds)}</span>!
            </p>
          </div>

          {/* Results Metric Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-surface rounded-2xl border border-border">
            <div>
              <p className="text-xs text-text-secondary">Final Score</p>
              <p className="text-xl font-outfit font-bold text-primary">{score}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Max Combo</p>
              <p className="text-xl font-outfit font-bold text-accent-yellow">🔥 {maxCombo}x</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Mistakes</p>
              <p className="text-xl font-outfit font-bold text-text-primary">{mistakes}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
            <Button
              variant="secondary"
              size="md"
              onClick={() => initGame(entries)}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Play Again
            </Button>
            <Link to={`/sets/${set.id}`}>
              <Button variant="primary" size="md">
                Back to Set
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
