import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowLeft, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { GameMode, VocabEntry } from '../../types';

interface StudyResultsLocationState {
  setId: string;
  setTitle: string;
  gameMode: GameMode;
  score: number;
  total: number;
  durationSeconds: number;
  correctWords: VocabEntry[];
  almostWords: VocabEntry[];
  missedWords: VocabEntry[];
}

export const StudyResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state as StudyResultsLocationState | undefined;

  useEffect(() => {
    if (!state) {
      navigate('/sets');
      return;
    }

    // Trigger celebration confetti
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#6C63FF', '#06D6A0', '#FFD166'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Record study session to Supabase
    if (user && state.setId) {
      supabase.from('study_sessions').insert({
        user_id: user.id,
        set_id: state.setId,
        game_mode: state.gameMode,
        score: state.score,
        total: state.total,
        duration_seconds: state.durationSeconds,
      }).then(({ error }) => {
        if (error) console.error('Failed to log study session:', error);
      });
    }
  }, [state, user]);

  if (!state) return null;

  const percentage = Math.round((state.score / Math.max(state.total, 1)) * 100);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-surface via-primary-light/20 to-surface">
      <div className="w-full max-w-xl space-y-6 animate-fade-in">
        <Card className="p-8 sm:p-10 shadow-modal border-primary/20 text-center space-y-6">
          {/* Top Emoji */}
          <div className="text-5xl animate-bounce-subtle">
            {percentage >= 80 ? '🎉' : percentage >= 50 ? '⭐' : '💪'}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-outfit font-bold text-primary">
              {percentage >= 80 ? 'Outstanding Job!' : percentage >= 50 ? 'Great Practice!' : 'Keep Practicing!'}
            </h1>
            <p className="text-sm font-medium text-text-secondary">
              Session completed for <span className="text-text-primary font-semibold">{state.setTitle}</span>
            </p>
          </div>

          {/* Score Display */}
          <div className="py-4">
            <div className="inline-flex flex-col items-center justify-center w-36 h-36 rounded-full border-8 border-accent-green bg-accent-green-light/30 shadow-inner">
              <span className="text-4xl font-outfit font-extrabold text-text-primary">{percentage}%</span>
              <span className="text-xs font-semibold text-text-secondary">
                {state.score} / {state.total} words
              </span>
            </div>
          </div>

          {/* Stat Pills Breakdown */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-2xl bg-[#E8FFF3] border border-[#06D6A0]/20 text-center">
              <CheckCircle2 className="w-5 h-5 text-[#059669] mx-auto mb-1" />
              <p className="text-lg font-outfit font-bold text-[#059669]">{state.correctWords.length}</p>
              <p className="text-[11px] font-semibold text-[#059669]/80">Got it</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF9E6] border border-[#FFD166]/30 text-center">
              <AlertCircle className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
              <p className="text-lg font-outfit font-bold text-[#F59E0B]">{state.almostWords.length}</p>
              <p className="text-[11px] font-semibold text-[#F59E0B]/80">Almost</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF0F0] border border-[#FF6B6B]/20 text-center">
              <XCircle className="w-5 h-5 text-[#DC2626] mx-auto mb-1" />
              <p className="text-lg font-outfit font-bold text-[#DC2626]">{state.missedWords.length}</p>
              <p className="text-[11px] font-semibold text-[#DC2626]/80">Missed</p>
            </div>
          </div>

          {/* Missed Words to Review */}
          {state.missedWords.length > 0 && (
            <div className="text-left space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Words to review ({state.missedWords.length}):
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-surface rounded-xl border border-border">
                {state.missedWords.map((word) => (
                  <div key={word.id} className="flex items-center justify-between text-xs px-2 py-1">
                    <span className="font-semibold text-primary">{word.word_en}</span>
                    <span className="font-sarabun text-text-secondary">{word.word_th}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link to={`/sets/${state.setId}/study/${state.gameMode}`} className="flex-1">
              <Button variant="primary" size="lg" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </Link>

            <Link to={`/sets/${state.setId}`} className="flex-1">
              <Button variant="ghost" size="lg" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Set
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
