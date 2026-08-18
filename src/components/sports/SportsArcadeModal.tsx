import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Flame,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  gamificationService,
  type PetData,
} from '../../services/gamificationService';

export type SportGameType = 'basketball' | 'darts' | 'soccer';

interface SportsArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
}

export const SportsArcadeModal: React.FC<SportsArcadeModalProps> = ({
  isOpen,
  onClose,
  pet,
}) => {
  const [selectedGame, setSelectedGame] = useState<SportGameType | null>(null);

  // Match State
  const [round, setRound] = useState(1);
  const maxRounds = 5;
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isGood: boolean } | null>(null);

  // 1. Basketball Timing Meter (0 - 100)
  const [aimPos, setAimPos] = useState(50);
  const aimDirection = useRef<number>(1);
  const [ballInFlight, setBallInFlight] = useState(false);

  // 2. Darts Reticle Movement (X: 10% - 90%, Y: 10% - 90%)
  const [dartX, setDartX] = useState(50);
  const [dartY, setDartY] = useState(50);
  const dartDirX = useRef<number>(1);
  const dartDirY = useRef<number>(1);
  const [dartStuck, setDartStuck] = useState<{ x: number; y: number } | null>(null);

  // 3. Soccer State
  const [goaliePos, setGoaliePos] = useState<'TL' | 'TR' | 'BL' | 'BR' | 'C'>('C');
  const [kickedBallPos, setKickedBallPos] = useState<'TL' | 'TR' | 'BL' | 'BR' | null>(null);

  // Animation Loop for real-time arcade mechanics
  useEffect(() => {
    if (!isOpen || !selectedGame || isGameOver || isShooting) return;

    const interval = setInterval(() => {
      // Basketball meter oscillation
      if (selectedGame === 'basketball') {
        setAimPos((prev) => {
          let next = prev + aimDirection.current * 4.5;
          if (next >= 96) {
            aimDirection.current = -1;
            next = 96;
          } else if (next <= 4) {
            aimDirection.current = 1;
            next = 4;
          }
          return next;
        });
      }

      // Darts Lissajous moving reticle
      if (selectedGame === 'darts') {
        setDartX((prev) => {
          let next = prev + dartDirX.current * 3.5;
          if (next >= 85) {
            dartDirX.current = -1;
            next = 85;
          } else if (next <= 15) {
            dartDirX.current = 1;
            next = 15;
          }
          return next;
        });

        setDartY((prev) => {
          let next = prev + dartDirY.current * 2.8;
          if (next >= 85) {
            dartDirY.current = -1;
            next = 85;
          } else if (next <= 15) {
            dartDirY.current = 1;
            next = 15;
          }
          return next;
        });
      }

      // Soccer Goalie Idle Jitter
      if (selectedGame === 'soccer') {
        const positions: ('TL' | 'TR' | 'BL' | 'BR' | 'C')[] = ['TL', 'TR', 'BL', 'BR', 'C'];
        setGoaliePos(positions[Math.floor(Math.random() * positions.length)]);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen, selectedGame, isGameOver, isShooting]);

  const startGame = (type: SportGameType) => {
    setSelectedGame(type);
    setRound(1);
    setPlayerScore(0);
    setBotScore(0);
    setIsGameOver(false);
    setIsShooting(false);
    setFeedback(null);
    setBallInFlight(false);
    setDartStuck(null);
    setKickedBallPos(null);
  };

  // -------------------------------------------------------------
  // GAME 1: BASKETBALL TIMING SHOT
  // -------------------------------------------------------------
  const handleBasketballShoot = () => {
    if (isShooting || isGameOver) return;
    setIsShooting(true);
    setBallInFlight(true);

    const currentAim = aimPos;
    let earnedPts = 0;
    let feedbackMsg = '';

    // Sweet Spot Zone: 40% to 60% = 3 Points (Perfect Swish)
    // Good Zone: 25% to 40% or 60% to 75% = 2 Points (Bank Shot)
    // Red Zone = 0 Points (Airball)
    if (currentAim >= 40 && currentAim <= 60) {
      earnedPts = 3;
      feedbackMsg = '🔥 SWISH 3-POINTER! PERFECT TIMING!';
    } else if (
      (currentAim >= 25 && currentAim < 40) ||
      (currentAim > 60 && currentAim <= 75)
    ) {
      earnedPts = 2;
      feedbackMsg = '🏀 2-POINT BANK SHOT! IN THE HOOP!';
    } else {
      earnedPts = 0;
      feedbackMsg = '💨 AIRBALL! MISSED RIM!';
    }

    setPlayerScore((prev) => prev + earnedPts);

    // Bot Shoot (Simulated Bot 55% accuracy)
    const botScored = Math.random() > 0.45;
    const botPts = botScored ? (Math.random() > 0.4 ? 3 : 2) : 0;
    setBotScore((prev) => prev + botPts);

    setTimeout(() => {
      setFeedback({
        text: `${feedbackMsg} ${botScored ? `(Bot +${botPts} pts)` : '(Bot missed!)'}`,
        isGood: earnedPts > 0,
      });

      setTimeout(() => {
        setFeedback(null);
        setBallInFlight(false);
        setIsShooting(false);

        if (round < maxRounds) {
          setRound((prev) => prev + 1);
        } else {
          finishMatch(playerScore + earnedPts, botScore + botPts);
        }
      }, 1400);
    }, 800);
  };

  // -------------------------------------------------------------
  // GAME 2: DARTS PRECISION THROW
  // -------------------------------------------------------------
  const handleDartThrow = () => {
    if (isShooting || isGameOver) return;
    setIsShooting(true);
    setDartStuck({ x: dartX, y: dartY });

    // Distance from center (50, 50)
    const dist = Math.sqrt(Math.pow(dartX - 50, 2) + Math.pow(dartY - 50, 2));
    let earnedPts = 0;
    let feedbackMsg = '';

    if (dist <= 10) {
      earnedPts = 50;
      feedbackMsg = '🎯 BULLSEYE 50 PTS! DEAD CENTER!';
    } else if (dist <= 22) {
      earnedPts = 30;
      feedbackMsg = '🌟 INNER RING 30 PTS! GREAT SHOT!';
    } else if (dist <= 35) {
      earnedPts = 15;
      feedbackMsg = '🎯 OUTER RING 15 PTS!';
    } else {
      earnedPts = 0;
      feedbackMsg = '❌ OFF BOARD! 0 PTS!';
    }

    setPlayerScore((prev) => prev + earnedPts);

    // Bot Throw
    const botPts = Math.random() > 0.5 ? 50 : Math.random() > 0.3 ? 30 : 15;
    setBotScore((prev) => prev + botPts);

    setFeedback({
      text: `${feedbackMsg} (Bot scored ${botPts} pts)`,
      isGood: earnedPts > 0,
    });

    setTimeout(() => {
      setFeedback(null);
      setDartStuck(null);
      setIsShooting(false);

      if (round < maxRounds) {
        setRound((prev) => prev + 1);
      } else {
        finishMatch(playerScore + earnedPts, botScore + botPts);
      }
    }, 1500);
  };

  // -------------------------------------------------------------
  // GAME 3: PENALTY SOCCER SHOOTOUT
  // -------------------------------------------------------------
  const handleSoccerKick = (corner: 'TL' | 'TR' | 'BL' | 'BR') => {
    if (isShooting || isGameOver) return;
    setIsShooting(true);
    setKickedBallPos(corner);

    // Goalie Dives to one of the 4 corners
    const possibleDives: ('TL' | 'TR' | 'BL' | 'BR')[] = ['TL', 'TR', 'BL', 'BR'];
    const botGoalieDive = possibleDives[Math.floor(Math.random() * possibleDives.length)];
    setGoaliePos(botGoalieDive);

    const isGoal = corner !== botGoalieDive;
    let feedbackMsg = '';

    if (isGoal) {
      feedbackMsg = '⚽ GOOOAL! Curved past the Slime Goalie!';
      setPlayerScore((prev) => prev + 1);
    } else {
      feedbackMsg = '🧤 SAVED! Goalie caught the ball!';
    }

    // Bot Striker Turn vs Your Pet (50% goal chance)
    const botGoal = Math.random() > 0.48;
    if (botGoal) {
      setBotScore((prev) => prev + 1);
    }

    setFeedback({
      text: `${feedbackMsg} ${botGoal ? '(Bot scored goal!)' : '(Your pet saved bot shot!)'}`,
      isGood: isGoal,
    });

    setTimeout(() => {
      setFeedback(null);
      setKickedBallPos(null);
      setGoaliePos('C');
      setIsShooting(false);

      if (round < maxRounds) {
        setRound((prev) => prev + 1);
      } else {
        finishMatch(playerScore + (isGoal ? 1 : 0), botScore + (botGoal ? 1 : 0));
      }
    }, 1600);
  };

  const finishMatch = (finalPlayerScore: number, finalBotScore: number) => {
    setIsGameOver(true);
    const won = finalPlayerScore >= finalBotScore;
    const statGain = won ? 4 : 2;
    const coinsReward = won ? 60 : 25;
    const expReward = won ? 80 : 35;

    gamificationService.trainPet('str', statGain);
    gamificationService.addCoins(coinsReward);
    gamificationService.addPetExp(expReward);
  };

  const PET_ICONS: Record<string, string> = {
    moji: '🌱',
    bubble: '💧',
    puipui: '🐣',
    luno: '😈',
    milly: '🐰',
    creamy: '🐑',
    gonga: '🦖',
    wingy: '❄️',
    shadow: '🐈‍⬛',
    citra: '🍊',
  };
  const petIcon = PET_ICONS[pet.type] || '🌱';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto bg-gradient-to-b from-white via-slate-50 to-orange-50/30 border-2 border-orange-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-md">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="verb" size="sm">
                ⚽ Sport Arcade League
              </Badge>
              <span className="text-xs text-text-muted font-bold">100% Real-Time Action</span>
            </div>
            <h2 className="text-2xl font-outfit font-bold text-text-primary mt-0.5">
              {selectedGame
                ? selectedGame === 'basketball'
                  ? '🏀 Arcade Basketball Shootout'
                  : selectedGame === 'soccer'
                  ? '⚽ Penalty Soccer Showdown'
                  : '🎯 Precision Darts Challenge'
                : 'Choose Your Sport Mini-Game'}
            </h2>
          </div>
        </div>

        {/* 1. Game Selection Hub */}
        {!selectedGame ? (
          <div className="space-y-6">
            <p className="text-sm text-text-secondary">
              พา <b>{pet.name}</b> เล่นมินิเกมกีฬาแท้ๆ สไตล์ 2D อาเขต ดวลแต้มสดๆ กับ Robo Bot 5 ช็อต เพื่อเพิ่มพลัง <b>STR & AGI</b> และรับเหรียญทอง!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Basketball */}
              <button
                onClick={() => startGame('basketball')}
                className="p-5 rounded-3xl border-2 border-orange-200 bg-white hover:border-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all text-center space-y-3 group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  🏀
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-text-primary">
                    Arcade Basketball
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 font-sarabun">
                    เกจส่ายไปมา กดชู้ตให้ลงจุดเขียว เพื่อสวิช 3 แต้ม!
                  </p>
                </div>
                <Badge variant="noun" size="sm">
                  +STR & +AGI
                </Badge>
              </button>

              {/* Darts */}
              <button
                onClick={() => startGame('darts')}
                className="p-5 rounded-3xl border-2 border-red-200 bg-white hover:border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all text-center space-y-3 group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-text-primary">
                    Precision Darts
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 font-sarabun">
                    เป้าหมุนวน กะจังหวะปาลูกดอกเข้าจุดกึ่งกลาง 50 แต้ม!
                  </p>
                </div>
                <Badge variant="verb" size="sm">
                  +AGI & +STR
                </Badge>
              </button>

              {/* Soccer */}
              <button
                onClick={() => startGame('soccer')}
                className="p-5 rounded-3xl border-2 border-emerald-200 bg-white hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all text-center space-y-3 group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  ⚽
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-text-primary">
                    Penalty Soccer
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 font-sarabun">
                    ดวลจุดโทษ เลือกมุมยิง 4 ทิศ หลอกสไลม์โกลกางตาข่าย!
                  </p>
                </div>
                <Badge variant="adj" size="sm">
                  +STR & +EXP
                </Badge>
              </button>
            </div>
          </div>
        ) : (
          /* 2. Active Mini-Game Screen */
          <div className="space-y-6">
            {/* Live Scoreboard Bar */}
            <div className="p-4 bg-slate-950 text-white rounded-3xl flex items-center justify-between font-outfit shadow-xl border border-slate-800">
              {/* Player Side */}
              <div className="flex items-center gap-3">
                <span className="text-3xl">{petIcon}</span>
                <div>
                  <p className="text-xs text-slate-400 font-bold">{pet.name} (You)</p>
                  <p className="text-3xl font-extrabold text-emerald-400">{playerScore}</p>
                </div>
              </div>

              {/* Round Badge */}
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-sm">
                  Shot {round} / {maxRounds}
                </span>
              </div>

              {/* Bot Side */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Robo Bot 🤖</p>
                  <p className="text-3xl font-extrabold text-red-400">{botScore}</p>
                </div>
                <span className="text-3xl">🤖</span>
              </div>
            </div>

            {/* Visual 2D Game Arena */}
            <div className="relative h-60 rounded-3xl overflow-hidden border-2 border-slate-200 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-400 flex items-center justify-center shadow-lg select-none">
              {/* ---------------- BASKETBALL ARENA ---------------- */}
              {selectedGame === 'basketball' && (
                <div className="w-full h-full relative flex flex-col items-center justify-between p-6">
                  {/* Hoop & Net */}
                  <div className="flex items-center justify-center relative">
                    <div className="text-5xl drop-shadow-lg">🗑️</div>
                    <div className="absolute -top-3 text-2xl font-bold text-red-600 bg-white/90 px-2 py-0.5 rounded-md shadow border">
                      TARGET
                    </div>
                  </div>

                  {/* Basketball Flight Animation */}
                  <div
                    className={`text-5xl transition-all duration-500 transform ${
                      ballInFlight ? '-translate-y-24 scale-75' : 'translate-y-0 scale-100'
                    }`}
                  >
                    🏀
                  </div>

                  {/* Timing Gauge */}
                  <div className="w-full max-w-sm space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-900 drop-shadow-sm">
                      <span className="text-red-700">MISS</span>
                      <span className="text-emerald-800 font-extrabold">⭐ SWEET SPOT (3 PTS) ⭐</span>
                      <span className="text-red-700">MISS</span>
                    </div>
                    <div className="w-full bg-slate-950/40 h-6 rounded-full relative p-0.5 overflow-hidden border-2 border-white/80 shadow-inner">
                      {/* 2-Point Zone */}
                      <div className="absolute left-[25%] w-[50%] h-full bg-amber-400/60" />
                      {/* 3-Point Sweet Spot */}
                      <div className="absolute left-[40%] w-[20%] h-full bg-emerald-400 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                      {/* Moving Aim Needle */}
                      <div
                        className="absolute top-0 w-3.5 h-full bg-white border-2 border-slate-950 rounded-full shadow-2xl transition-all"
                        style={{ left: `${aimPos}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- DARTS ARENA ---------------- */}
              {selectedGame === 'darts' && (
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Dartboard */}
                  <div className="w-48 h-48 rounded-full border-8 border-slate-900 bg-amber-100 flex items-center justify-center shadow-2xl relative">
                    {/* Outer Ring */}
                    <div className="w-36 h-36 rounded-full border-4 border-red-600 bg-emerald-700/80 flex items-center justify-center">
                      {/* Inner Ring */}
                      <div className="w-24 h-24 rounded-full border-4 border-amber-400 bg-white flex items-center justify-center">
                        {/* Bullseye */}
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-extrabold text-xs shadow-inner animate-pulse">
                          50
                        </div>
                      </div>
                    </div>

                    {/* Moving Aim Reticle */}
                    {!dartStuck && (
                      <div
                        className="absolute w-10 h-10 pointer-events-none transition-all duration-75"
                        style={{ left: `${dartX}%`, top: `${dartY}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <div className="w-full h-full rounded-full border-2 border-red-500 border-dashed animate-spin flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                      </div>
                    )}

                    {/* Stuck Dart */}
                    {dartStuck && (
                      <div
                        className="absolute text-3xl transform -translate-x-1/2 -translate-y-1/2 drop-shadow-xl animate-bounce"
                        style={{ left: `${dartStuck.x}%`, top: `${dartStuck.y}%` }}
                      >
                        🎯
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------------- SOCCER ARENA ---------------- */}
              {selectedGame === 'soccer' && (
                <div className="w-full h-full relative flex flex-col items-center justify-between p-4">
                  {/* Goal Frame */}
                  <div className="w-72 h-36 border-4 border-white bg-slate-950/20 rounded-t-2xl relative shadow-2xl backdrop-blur-xs flex items-center justify-center overflow-hidden">
                    {/* Corner Target Indicators */}
                    <span className="absolute top-2 left-2 text-xs font-bold text-white/80 bg-black/40 px-1.5 rounded">
                      TL ↖
                    </span>
                    <span className="absolute top-2 right-2 text-xs font-bold text-white/80 bg-black/40 px-1.5 rounded">
                      TR ↗
                    </span>
                    <span className="absolute bottom-2 left-2 text-xs font-bold text-white/80 bg-black/40 px-1.5 rounded">
                      BL ↙
                    </span>
                    <span className="absolute bottom-2 right-2 text-xs font-bold text-white/80 bg-black/40 px-1.5 rounded">
                      BR ↘
                    </span>

                    {/* Monster Goalie 👾 */}
                    <div
                      className={`text-5xl transition-all duration-300 transform drop-shadow-2xl ${
                        goaliePos === 'TL'
                          ? '-translate-x-24 -translate-y-8'
                          : goaliePos === 'TR'
                          ? 'translate-x-24 -translate-y-8'
                          : goaliePos === 'BL'
                          ? '-translate-x-24 translate-y-6'
                          : goaliePos === 'BR'
                          ? 'translate-x-24 translate-y-6'
                          : 'translate-x-0 translate-y-0'
                      }`}
                    >
                      👾
                    </div>
                  </div>

                  {/* Ball on Penalty Spot */}
                  <div
                    className={`text-4xl transition-all duration-300 transform ${
                      kickedBallPos === 'TL'
                        ? '-translate-x-24 -translate-y-28 scale-75'
                        : kickedBallPos === 'TR'
                        ? 'translate-x-24 -translate-y-28 scale-75'
                        : kickedBallPos === 'BL'
                        ? '-translate-x-24 -translate-y-16 scale-75'
                        : kickedBallPos === 'BR'
                        ? 'translate-x-24 -translate-y-16 scale-75'
                        : 'translate-x-0 translate-y-0 scale-100'
                    }`}
                  >
                    ⚽
                  </div>
                </div>
              )}

              {/* Floating Feedback Banner */}
              {feedback && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center animate-fade-in z-30">
                  <span
                    className={`px-6 py-3 rounded-2xl font-outfit font-extrabold text-lg sm:text-xl shadow-2xl border-2 border-white ${
                      feedback.isGood
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {feedback.text}
                  </span>
                </div>
              )}
            </div>

            {/* 3. Pure Action Controls */}
            {!isGameOver ? (
              <div className="space-y-3">
                {/* Basketball Controls */}
                {selectedGame === 'basketball' && (
                  <div className="text-center space-y-3">
                    <p className="text-xs font-bold text-text-secondary">
                      กะจังหวะให้แถบสีขาววิ่งเข้าสู่จุดกึ่งกลางสีเขียว แล้วกดปุ่ม <b>SHOOT!</b> ทันที
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleBasketballShoot}
                      disabled={isShooting}
                      className="w-full py-4 text-xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-xl justify-center active:scale-95"
                    >
                      <Flame className="w-6 h-6 mr-2 fill-white" />
                      🏀 SHOOT BASKETBALL! 🏀
                    </Button>
                  </div>
                )}

                {/* Darts Controls */}
                {selectedGame === 'darts' && (
                  <div className="text-center space-y-3">
                    <p className="text-xs font-bold text-text-secondary">
                      ล็อคเป้าเป้าปาเป้าที่เคลื่อนไหวให้อยู่ตรงกลาง แล้วกด <b>THROW DART!</b>
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleDartThrow}
                      disabled={isShooting}
                      className="w-full py-4 text-xl font-bold bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 shadow-xl justify-center active:scale-95"
                    >
                      <Sparkles className="w-6 h-6 mr-2" />
                      🎯 THROW DART! 🎯
                    </Button>
                  </div>
                )}

                {/* Soccer Controls (4 Corners) */}
                {selectedGame === 'soccer' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-text-secondary text-center">
                      เลือก 1 ใน 4 มุมเพื่อยิงลูกโทษ หลอกสไลม์โกลไปอีกทาง!
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleSoccerKick('TL')}
                        disabled={isShooting}
                        className="py-3 font-bold flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50"
                      >
                        <ArrowUpLeft className="w-5 h-5 text-emerald-600" />
                        Top Left ↖
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleSoccerKick('TR')}
                        disabled={isShooting}
                        className="py-3 font-bold flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50"
                      >
                        Top Right ↗
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleSoccerKick('BL')}
                        disabled={isShooting}
                        className="py-3 font-bold flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50"
                      >
                        <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                        Bottom Left ↙
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleSoccerKick('BR')}
                        disabled={isShooting}
                        className="py-3 font-bold flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50"
                      >
                        Bottom Right ↘
                        <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 4. Match Outcome & Rewards */
              <div className="p-6 text-center space-y-5 bg-white rounded-3xl border-2 border-border shadow-xl animate-fade-in">
                <div
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-md ${
                    playerScore >= botScore
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {playerScore >= botScore ? '🏆' : '🥈'}
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-outfit font-bold text-text-primary">
                    {playerScore >= botScore
                      ? 'Victory! You Crushed the Bot! 🎉'
                      : 'Good Match! Bot Won This Round! 🤖'}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Final Result: {pet.name} ({playerScore}) vs Robo Bot ({botScore})
                  </p>
                </div>

                {/* Stat Boosts */}
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-around font-outfit font-bold text-sm">
                  <div>
                    <p className="text-xs text-text-secondary">Coins Earned</p>
                    <p className="text-accent-yellow">+{playerScore >= botScore ? 60 : 25} 🪙</p>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <p className="text-xs text-text-secondary">Pet Stats Gain</p>
                    <p className="text-emerald-600">+{playerScore >= botScore ? 4 : 2} STR & AGI 💪</p>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <p className="text-xs text-text-secondary">Pet EXP</p>
                    <p className="text-primary">+{playerScore >= botScore ? 80 : 35} ⭐</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => startGame(selectedGame)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> Rematch
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setSelectedGame(null)}
                  >
                    Select Another Sport
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
