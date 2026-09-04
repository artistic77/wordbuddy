import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Gift, Sparkles, Trophy } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { gamificationService, type DailyMission } from '../../services/gamificationService';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({ isOpen, onClose }) => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const loadMissions = () => {
    setMissions(gamificationService.getDailyMissions());
  };

  useEffect(() => {
    if (isOpen) {
      loadMissions();
    }
    const handleUpdate = () => loadMissions();
    window.addEventListener('wb:missions_updated', handleUpdate);
    return () => window.removeEventListener('wb:missions_updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = (missionId: string, title: string) => {
    const res = gamificationService.claimMissionReward(missionId);
    if (res.success) {
      loadMissions();
      setClaimedNotice(`Claimed +${res.coins} Coins & +${res.exp} Pet EXP from "${title}"! 🎉`);
      setTimeout(() => setClaimedNotice(null), 3500);
    }
  };

  const completedCount = missions.filter((m) => m.isCompleted).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg p-0 my-auto max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl relative border-primary/20 bg-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary-light flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0">
              🎯
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-outfit font-bold text-text-primary">
                Daily Missions
              </h2>
              <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 font-sarabun">
                ภารกิจประจำวันเพื่อรับเหรียญ 🪙 และ EXP สัตว์เลี้ยง
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 text-text-secondary hover:text-text-primary rounded-2xl bg-surface hover:bg-surface-elevated border border-border transition-all active:scale-95 flex-shrink-0 ml-2"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          {/* Claim Notice */}
          {claimedNotice && (
            <div className="p-3.5 bg-accent-green-light border border-accent-green text-green-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-accent-green flex-shrink-0" />
              <span>{claimedNotice}</span>
            </div>
          )}

          {/* Progress Overview Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-light via-accent-yellow-light/50 to-white border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Today's Progress
              </span>
              <p className="text-base font-outfit font-bold text-text-primary mt-0.5">
                {completedCount} of {missions.length} Missions Completed
              </p>
            </div>
            <Badge variant="verb" size="md">
              <Trophy className="w-3.5 h-3.5 mr-1" />
              {Math.round((completedCount / (missions.length || 1)) * 100)}%
            </Badge>
          </div>

          {/* Missions List */}
          <div className="space-y-3">
            {missions.map((mission) => {
              const progressPercent = Math.min(100, (mission.progress / mission.target) * 100);

              return (
                <div
                  key={mission.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    mission.isClaimed
                      ? 'bg-surface-elevated/40 border-border opacity-75'
                      : mission.isCompleted
                      ? 'bg-accent-green-light/40 border-accent-green shadow-sm'
                      : 'bg-white border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl select-none">{mission.icon}</span>
                      <div className="space-y-1">
                        <h4 className="font-outfit font-bold text-sm text-text-primary">
                          {mission.title}
                        </h4>
                        <p className="text-xs text-text-secondary">{mission.description}</p>

                        {/* Reward Pills */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-accent-yellow-light text-accent-yellow border border-accent-yellow/20">
                            +{mission.rewardCoins} Coins 🪙
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary-light text-primary border border-primary/20">
                            +{mission.rewardExp} Pet EXP ⭐
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {mission.isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-green px-2.5 py-1 rounded-xl bg-accent-green-light">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                        </span>
                      ) : mission.isCompleted ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleClaim(mission.id, mission.title)}
                          className="shadow-primary-btn animate-pulse"
                        >
                          <Gift className="w-3.5 h-3.5 mr-1" />
                          Claim
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-text-muted px-2.5 py-1 rounded-xl bg-surface-elevated">
                          {mission.progress}/{mission.target}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  {!mission.isClaimed && (
                    <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          mission.isCompleted ? 'bg-accent-green' : 'bg-primary'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer with Close Button */}
        <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            ปิดหน้าต่าง (Close)
          </Button>
        </div>
      </Card>
    </div>
  );
};
