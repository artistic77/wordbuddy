import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

interface GameHeaderProps {
  setId: string;
  setTitle: string;
  gameModeTitle: string;
  currentIndex: number;
  totalWords: number;
  secondsElapsed?: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  setId,
  setTitle,
  gameModeTitle,
  currentIndex,
  totalWords,
  secondsElapsed = 0,
}) => {
  const progressPercent = totalWords > 0 ? Math.round(((currentIndex + 1) / totalWords) * 100) : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 mb-6">
      <div className="flex items-center justify-between">
        {/* Back Link */}
        <Link
          to={`/sets/${setId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit to {setTitle}
        </Link>

        {/* Game Mode Title */}
        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-2.5 py-1 rounded-full">
          {gameModeTitle}
        </span>

        {/* Timer */}
        <div className="flex items-center gap-1 text-xs font-medium text-text-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(secondsElapsed)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
          <span>Question {currentIndex + 1} of {totalWords}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
