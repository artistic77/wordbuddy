import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Swords,
  ArrowLeft,
  Flame,
  Trophy,
  Lock,
  Volume2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  gamificationService,
  BOSS_STAGES,
  type BossStage,
  type PetData,
} from '../../services/gamificationService';
import { vocabPoolService, type GeneratedGameQuestion } from '../../services/vocabPoolService';
import { speakWord } from '../../services/ttsService';
import { PetAvatar } from '../pet/PetSanctuaryPage';

export const BossBattlePage: React.FC = () => {
  const [pet, setPet] = useState<PetData>(gamificationService.getActivePet());
  const [unlockedStages, setUnlockedStages] = useState<number[]>(
    gamificationService.getUnlockedStages()
  );
  const [selectedStage, setSelectedStage] = useState<BossStage | null>(null);

  // Combat State
  const [bossHp, setBossHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [powerGauge, setPowerGauge] = useState(0); // 0 to 3
  const [damagePopup, setDamagePopup] = useState<{ text: string; isBoss: boolean } | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questions, setQuestions] = useState<GeneratedGameQuestion[]>([]);

  const [isBattleOver, setIsBattleOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedExp, setEarnedExp] = useState(0);

  useEffect(() => {
    setPet(gamificationService.getActivePet());
    setUnlockedStages(gamificationService.getUnlockedStages());
  }, []);

  const startBattle = (stage: BossStage) => {
    setSelectedStage(stage);
    setBossHp(stage.maxHp);
    setPlayerHp(100);
    setPowerGauge(0);
    setIsBattleOver(false);
    setIsVictory(false);
    setDamagePopup(null);
    setCurrentQIndex(0);

    const difficulty =
      stage.stageNumber <= 2 ? 'easy' : stage.stageNumber <= 3 ? 'medium' : 'hard';
    const poolQuestions = vocabPoolService.getRandomQuestions(35, difficulty, 'mixed');
    setQuestions(poolQuestions);
  };

  const handleAnswer = (selectedOption: string) => {
    if (!selectedStage || isBattleOver || questions.length === 0) return;

    const currentQ = questions[currentQIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      speakWord(currentQ.audioText, currentQ.audioLang);
      // Calculate Player Damage: (STR * 4) + (INT * 2.5) + Base
      const baseDmg = Math.round(pet.str * 4 + pet.intStat * 2.5 + Math.random() * 20);
      const newGauge = Math.min(3, powerGauge + 1);
      setPowerGauge(newGauge);

      const nextBossHp = Math.max(0, bossHp - baseDmg);
      setBossHp(nextBossHp);

      setDamagePopup({ text: `💥 -${baseDmg} CRITICAL!`, isBoss: true });
      setTimeout(() => setDamagePopup(null), 1200);

      // Check Victory
      if (nextBossHp <= 0) {
        setIsBattleOver(true);
        setIsVictory(true);
        setEarnedCoins(selectedStage.rewardCoins);
        setEarnedExp(selectedStage.rewardExp);

        gamificationService.addCoins(selectedStage.rewardCoins);
        gamificationService.addPetExp(selectedStage.rewardExp);
        gamificationService.unlockNextStage(selectedStage.stageNumber);
        setUnlockedStages(gamificationService.getUnlockedStages());
        return;
      }
    } else {
      // Boss Counter-attack
      const bossDmg = selectedStage.atk;
      const nextPlayerHp = Math.max(0, playerHp - bossDmg);
      setPlayerHp(nextPlayerHp);

      setDamagePopup({ text: `💔 -${bossDmg} HIT!`, isBoss: false });
      setTimeout(() => setDamagePopup(null), 1200);

      // Check Defeat
      if (nextPlayerHp <= 0) {
        setIsBattleOver(true);
        setIsVictory(false);
        return;
      }
    }

    // Advance to next question
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      const difficulty =
        selectedStage.stageNumber <= 2 ? 'easy' : selectedStage.stageNumber <= 3 ? 'medium' : 'hard';
      setQuestions(vocabPoolService.getRandomQuestions(35, difficulty, 'mixed'));
      setCurrentQIndex(0);
    }
  };

  const handleUltimateBurst = () => {
    if (!selectedStage || powerGauge < 3 || isBattleOver) return;

    // Mega Ultimate Attack!
    const ultimateDmg = Math.round(pet.power * 12 + pet.str * 6);
    const nextBossHp = Math.max(0, bossHp - ultimateDmg);
    setBossHp(nextBossHp);
    setPowerGauge(0);

    setDamagePopup({ text: `🌟🔥 ULTIMATE BURST -${ultimateDmg}!! 🔥🌟`, isBoss: true });
    setTimeout(() => setDamagePopup(null), 1600);

    if (nextBossHp <= 0) {
      setIsBattleOver(true);
      setIsVictory(true);
      setEarnedCoins(selectedStage.rewardCoins);
      setEarnedExp(selectedStage.rewardExp);

      gamificationService.addCoins(selectedStage.rewardCoins);
      gamificationService.addPetExp(selectedStage.rewardExp);
      gamificationService.unlockNextStage(selectedStage.stageNumber);
      setUnlockedStages(gamificationService.getUnlockedStages());
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/pet"
            className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-elevated transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="verb" size="sm">
                ⚔️ Adventure Arena
              </Badge>
              <span className="text-xs text-text-muted">Stage Boss Battle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-text-primary mt-1">
              {selectedStage ? selectedStage.name : 'Boss Battle Campaign'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/pet">
            <Button variant="secondary" size="md">
              🐾 Pet Sanctuary
            </Button>
          </Link>
        </div>
      </div>

      {/* Stage Selector Screen */}
      {!selectedStage ? (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-primary-light via-indigo-50 to-white rounded-3xl border border-primary/20 space-y-2">
            <h2 className="text-xl font-outfit font-bold text-text-primary">
              Select Your Adventure Stage
            </h2>
            <p className="text-xs text-text-secondary">
              พา {pet.name} (Lv.{pet.level}) บุกตะลุยด่านเพื่อกำจัดมอนสเตอร์และรับเหรียญทองก้อนโต!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BOSS_STAGES.map((stage) => {
              const isUnlocked = unlockedStages.includes(stage.stageNumber);

              return (
                <Card
                  key={stage.id}
                  className={`p-6 flex flex-col justify-between space-y-6 transition-all relative overflow-hidden ${
                    isUnlocked
                      ? 'hover:border-primary hover:shadow-card hover:-translate-y-1'
                      : 'opacity-60 bg-surface-elevated/60 border-dashed'
                  }`}
                >
                  {/* Stage Number Badge */}
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface-elevated text-text-secondary">
                      Stage {stage.stageNumber}
                    </span>
                    {!isUnlocked && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-text-muted px-2 py-0.5 rounded-md bg-surface-elevated">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  {/* Boss Avatar & Info */}
                  <div className="text-center space-y-2">
                    <div
                      className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${stage.avatarBg} flex items-center justify-center text-5xl shadow-lg border-2 border-white/50`}
                    >
                      {stage.icon}
                    </div>
                    <h3 className="font-outfit font-bold text-lg text-text-primary">
                      {stage.name}
                    </h3>
                    <p className="text-xs text-text-muted font-sarabun">{stage.title}</p>
                  </div>

                  {/* Stage Rewards */}
                  <div className="pt-3 border-t border-border flex justify-between text-xs font-bold">
                    <span className="text-accent-yellow">+{stage.rewardCoins} 🪙</span>
                    <span className="text-primary">+{stage.rewardExp} Pet EXP</span>
                    <span className="text-red-500">{stage.maxHp} HP</span>
                  </div>

                  {/* Battle Button */}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => startBattle(stage)}
                    disabled={!isUnlocked}
                    className="w-full justify-center shadow-primary-btn"
                  >
                    <Swords className="w-4 h-4 mr-1.5" />
                    {isUnlocked ? 'Fight Boss! ⚔️' : 'Locked'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active Combat Arena Screen */
        <div className="space-y-6">
          {/* Back to Stages Link */}
          <button
            onClick={() => setSelectedStage(null)}
            className="text-xs font-bold text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            ← Back to Stage Selection
          </button>

          {/* Arena Stage Display */}
          <Card
            className={`p-6 sm:p-10 bg-gradient-to-b ${selectedStage.bgClass} text-white rounded-3xl shadow-2xl relative overflow-hidden border-2 border-white/10`}
          >
            {/* Damage Popup Banner */}
            {damagePopup && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-bounce">
                <span
                  className={`text-2xl sm:text-4xl font-outfit font-extrabold px-6 py-3 rounded-2xl shadow-2xl ${
                    damagePopup.isBoss
                      ? 'bg-amber-400 text-slate-950 border-2 border-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {damagePopup.text}
                </span>
              </div>
            )}

            {/* Duel Characters & HP Bars */}
            <div className="grid grid-cols-2 gap-6 sm:gap-12 items-center py-4 sm:py-8">
              {/* Left: Player Pet */}
              <div className="space-y-3 text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto sm:mx-0 flex items-center justify-center">
                  <PetAvatar
                    type={pet.type}
                    size="sm"
                    isCheering={powerGauge >= 3}
                    equippedAccessories={pet.equippedAccessories}
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <span className="text-sm font-bold font-outfit text-white">
                    {pet.nameTh ? `${pet.nameTh} (${pet.name})` : pet.name} (Lv.{pet.level})
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-white font-bold">
                    Player
                  </span>
                </div>

                {/* Player HP Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-white/80">
                    <span>HP</span>
                    <span>{playerHp} / 100</span>
                  </div>
                  <div className="w-full bg-black/40 h-3.5 rounded-full overflow-hidden border border-white/20 p-0.5">
                    <div
                      className="bg-accent-green h-full rounded-full transition-all duration-300"
                      style={{ width: `${playerHp}%` }}
                    />
                  </div>
                </div>

                {/* Ultimate Power Gauge */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-amber-300">BURST:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`w-5 h-2 rounded-full transition-all ${
                          powerGauge >= bar
                            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Boss Monster */}
              <div className="space-y-3 text-center sm:text-right">
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                    BOSS
                  </span>
                  <span className="text-sm font-bold font-outfit text-white">
                    {selectedStage.name}
                  </span>
                </div>

                {/* Boss HP Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-white/80">
                    <span>HP</span>
                    <span>
                      {bossHp} / {selectedStage.maxHp}
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-3.5 rounded-full overflow-hidden border border-white/20 p-0.5">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(bossHp / selectedStage.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quiz Battle Attack Terminal */}
          {!isBattleOver && questions.length > 0 ? (
            <Card className="p-6 sm:p-8 space-y-6 shadow-card border-primary/20">
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary-light text-primary uppercase tracking-wider">
                      {questions[currentQIndex]?.mode === 'en_to_th'
                        ? '🇺🇸 English ➔ 🇹🇭 แปลไทย'
                        : '🇹🇭 ภาษาไทย ➔ 🇺🇸 แปลอังกฤษ'}
                    </span>
                    <span className="text-xs text-text-muted">
                      Question {currentQIndex + 1} / {questions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <h3 className="text-3xl font-outfit font-bold text-text-primary">
                      {questions[currentQIndex]?.questionPrompt}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        speakWord(
                          questions[currentQIndex]?.audioText,
                          questions[currentQIndex]?.audioLang
                        )
                      }
                      className="p-2 rounded-xl bg-primary-light text-primary hover:bg-primary/20 transition-colors"
                      title="Listen Pronunciation"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {questions[currentQIndex]?.subPrompt && (
                    <p className="text-xs text-text-secondary font-sarabun">
                      {questions[currentQIndex]?.subPrompt}
                    </p>
                  )}
                </div>

                {/* Ultimate Burst Button */}
                {powerGauge >= 3 && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleUltimateBurst}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-lg animate-pulse"
                  >
                    <Flame className="w-5 h-5 mr-1.5 fill-white" />
                    Cast Ultimate Burst! 🔥
                  </Button>
                )}
              </div>

              {/* 4 Choice Attack Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questions[currentQIndex]?.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="p-4 rounded-2xl border-2 border-border bg-white hover:border-primary hover:bg-primary-light font-sarabun font-bold text-base text-text-primary transition-all active:scale-95 shadow-sm text-left flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <Swords className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            /* Battle Outcome Screen */
            <Card className="p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fade-in max-w-xl mx-auto">
              <div
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  isVictory
                    ? 'bg-accent-green-light text-accent-green'
                    : 'bg-red-100 text-red-500'
                }`}
              >
                {isVictory ? (
                  <Trophy className="w-14 h-14" />
                ) : (
                  <XCircle className="w-14 h-14" />
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-outfit font-bold text-text-primary">
                  {isVictory ? 'Victory! Boss Defeated! 🏆' : 'Defeated by Boss... 💔'}
                </h2>
                <p className="text-sm text-text-secondary">
                  {isVictory
                    ? `You conquered ${selectedStage.name} and proved your vocabulary might!`
                    : `Your pet needs more training. Feed and train ${pet.name} to challenge again!`}
                </p>
              </div>

              {/* Rewards Box */}
              {isVictory && (
                <div className="p-4 bg-accent-yellow-light/60 border border-accent-yellow/40 rounded-2xl flex items-center justify-around font-outfit font-bold">
                  <div>
                    <p className="text-xs text-text-secondary">Coins Earned</p>
                    <p className="text-xl text-accent-yellow">+{earnedCoins} 🪙</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <p className="text-xs text-text-secondary">Pet EXP</p>
                    <p className="text-xl text-primary">+{earnedExp} ⭐</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => startBattle(selectedStage)}
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Rematch
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setSelectedStage(null)}
                >
                  Stage Select
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
