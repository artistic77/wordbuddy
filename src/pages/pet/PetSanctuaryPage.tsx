import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Utensils,
  Trophy,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Volume2,
  X,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  gamificationService,
  type PetData,
  type PetType,
  type PetAccessory,
  SHOP_ITEMS,
  FASHION_GLASSES,
  FASHION_OUTFITS,
} from '../../services/gamificationService';
import { vocabPoolService, type GeneratedGameQuestion } from '../../services/vocabPoolService';
import { speakWord } from '../../services/ttsService';
import { SportsArcadeModal } from '../../components/sports/SportsArcadeModal';

export const PET_ROSTER: {
  type: PetType;
  name: string;
  nameTh: string;
  personality: string;
  color: string;
  bgGradient: string;
  icon: string;
  hatIcon: string;
  glassesIcon: string;
  clothesIcon: string;
}[] = [
  {
    type: 'moji',
    name: 'Moji',
    nameTh: 'โมจิ',
    personality: 'อ่อนโยน ขี้อาย',
    color: '#86efac',
    bgGradient: 'from-emerald-300 via-green-200 to-teal-100',
    icon: '🌱',
    hatIcon: '🧢',
    glassesIcon: '👓',
    clothesIcon: '👕',
  },
  {
    type: 'bubble',
    name: 'Bubble',
    nameTh: 'บับเบิ้ล',
    personality: 'สดใส ร่าเริง',
    color: '#7dd3fc',
    bgGradient: 'from-sky-300 via-blue-200 to-indigo-100',
    icon: '💧',
    hatIcon: '🧢',
    glassesIcon: '🕶️',
    clothesIcon: '👗',
  },
  {
    type: 'puipui',
    name: 'Pui Pui',
    nameTh: 'ปุยปุย',
    personality: 'ร่าเริง ขี้เล่น',
    color: '#fde047',
    bgGradient: 'from-amber-300 via-yellow-200 to-orange-100',
    icon: '🐣',
    hatIcon: '👒',
    glassesIcon: '🕶️',
    clothesIcon: '🧥',
  },
  {
    type: 'luno',
    name: 'Luno',
    nameTh: 'ลูโน่',
    personality: 'ลึกลับ เท่ๆ',
    color: '#c084fc',
    bgGradient: 'from-purple-400 via-violet-300 to-indigo-200',
    icon: '😈',
    hatIcon: '😈',
    glassesIcon: '🕶️',
    clothesIcon: '🧥',
  },
  {
    type: 'milly',
    name: 'Milly',
    nameTh: 'มิลลี่',
    personality: 'น่ารัก อ่อนหวาน',
    color: '#f472b6',
    bgGradient: 'from-pink-300 via-rose-200 to-red-100',
    icon: '🐰',
    hatIcon: '👒',
    glassesIcon: '🕶️',
    clothesIcon: '👗',
  },
  {
    type: 'creamy',
    name: 'Creamy',
    nameTh: 'ครีมมี่',
    personality: 'ใจดี อบอุ่น',
    color: '#fef08a',
    bgGradient: 'from-amber-200 via-orange-100 to-amber-50',
    icon: '🐑',
    hatIcon: '👒',
    glassesIcon: '👓',
    clothesIcon: '🧥',
  },
  {
    type: 'gonga',
    name: 'Gonga',
    nameTh: 'กองก้า',
    personality: 'ซุกซน แข็งแรง',
    color: '#4ade80',
    bgGradient: 'from-emerald-400 via-green-300 to-lime-100',
    icon: '🦖',
    hatIcon: '🧢',
    glassesIcon: '🕶️',
    clothesIcon: '🧥',
  },
  {
    type: 'wingy',
    name: 'Wingy',
    nameTh: 'วิงกี้',
    personality: 'ขี้สงสัย ช่างฝัน',
    color: '#e2e8f0',
    bgGradient: 'from-slate-100 via-sky-100 to-blue-50',
    icon: '❄️',
    hatIcon: '🪽',
    glassesIcon: '👓',
    clothesIcon: '👗',
  },
  {
    type: 'shadow',
    name: 'Shadow',
    nameTh: 'ชาโดว์',
    personality: 'สุขุม นิ่งๆ',
    color: '#334155',
    bgGradient: 'from-slate-800 via-slate-700 to-purple-950',
    icon: '🐈‍⬛',
    hatIcon: '🎩',
    glassesIcon: '🕶️',
    clothesIcon: '🤵',
  },
  {
    type: 'citra',
    name: 'Citra',
    nameTh: 'ซิตร้า',
    personality: 'สดใส มองโลกในแง่บวก',
    color: '#fb923c',
    bgGradient: 'from-orange-400 via-amber-300 to-yellow-100',
    icon: '🍊',
    hatIcon: '🍊',
    glassesIcon: '🕶️',
    clothesIcon: '🧥',
  },
];

// Eyewear Visual Overlay Layer Component
export const EyewearOverlay: React.FC<{ glassesId?: string }> = ({ glassesId }) => {
  if (!glassesId) return null;

  switch (glassesId) {
    case 'gl_round':
    case 'gl_clear_round':
    case 'gl_vintage':
      return (
        <div className="absolute top-16 flex items-center justify-center gap-3 z-30 pointer-events-none">
          <div className="w-9 h-9 rounded-full border-3 border-slate-900 bg-cyan-200/20 shadow-sm" />
          <div className="w-3 h-0.5 bg-slate-900 -mx-1" />
          <div className="w-9 h-9 rounded-full border-3 border-slate-900 bg-cyan-200/20 shadow-sm" />
        </div>
      );
    case 'gl_star':
      return (
        <div className="absolute top-16 flex items-center justify-center gap-3 z-30 pointer-events-none">
          <div className="text-2xl drop-shadow-md">⭐</div>
          <div className="w-2 h-0.5 bg-amber-600 -mx-1" />
          <div className="text-2xl drop-shadow-md">⭐</div>
        </div>
      );
    case 'gl_pixel':
      return (
        <div className="absolute top-17 flex items-center justify-center z-30 pointer-events-none">
          <div className="px-3 py-1.5 bg-slate-950 text-white text-[11px] font-mono font-bold tracking-widest rounded-xs border border-white/80 shadow-lg">
            ■■■ ■■■
          </div>
        </div>
      );
    case 'gl_heart':
    case 'gl_black_heart':
      return (
        <div className="absolute top-16 flex items-center justify-center gap-2 z-30 pointer-events-none">
          <span className="text-2xl">{glassesId === 'gl_heart' ? '💖' : '🖤'}</span>
          <span className="text-2xl">{glassesId === 'gl_heart' ? '💖' : '🖤'}</span>
        </div>
      );
    case 'gl_square':
      return (
        <div className="absolute top-16 flex items-center justify-center gap-3 z-30 pointer-events-none">
          <div className="w-8 h-8 rounded-md border-3 border-emerald-800 bg-emerald-100/30" />
          <div className="w-3 h-0.5 bg-emerald-800 -mx-1" />
          <div className="w-8 h-8 rounded-md border-3 border-emerald-800 bg-emerald-100/30" />
        </div>
      );
    case 'gl_monocle':
      return (
        <div className="absolute top-16 right-10 z-30 pointer-events-none flex flex-col items-center">
          <div className="w-9 h-9 rounded-full border-3 border-amber-500 bg-amber-100/20 shadow-md" />
          <div className="w-0.5 h-6 bg-amber-500/80 -mr-4 -mt-1" />
        </div>
      );
    case 'gl_pineapple':
      return (
        <div className="absolute top-15 flex items-center justify-center gap-2 z-30 pointer-events-none">
          <span className="text-2xl">🍍</span>
          <span className="text-2xl">🍍</span>
        </div>
      );
    case 'gl_lemon':
      return (
        <div className="absolute top-15 flex items-center justify-center gap-2 z-30 pointer-events-none">
          <span className="text-2xl">🍋</span>
          <span className="text-2xl">🍋</span>
        </div>
      );
    default:
      // Default sleek sunglasses / aviator
      return (
        <div className="absolute top-17 flex items-center justify-center gap-2 z-30 pointer-events-none">
          <div className="w-9 h-6 rounded-t-sm rounded-b-xl bg-slate-950/90 border border-white/60 shadow-md" />
          <div className="w-2 h-0.5 bg-slate-950" />
          <div className="w-9 h-6 rounded-t-sm rounded-b-xl bg-slate-950/90 border border-white/60 shadow-md" />
        </div>
      );
  }
};

// Outfit Visual Overlay Layer Component
export const OutfitOverlay: React.FC<{ outfitId?: string }> = ({ outfitId }) => {
  if (!outfitId) return null;

  switch (outfitId) {
    case 'cl_hoodie':
      return (
        <div className="absolute bottom-1 w-32 h-14 bg-emerald-700 rounded-t-3xl border-2 border-emerald-900 shadow-md z-20 flex items-center justify-center">
          <div className="w-10 h-6 bg-emerald-800/80 rounded-lg border border-emerald-600" />
        </div>
      );
    case 'cl_student':
      return (
        <div className="absolute bottom-1 w-32 h-14 bg-indigo-900 rounded-t-3xl border-2 border-white shadow-md z-20 flex flex-col items-center justify-center">
          <div className="w-16 h-4 bg-white rounded-t-sm" />
          <span className="text-xs text-rose-400 font-bold -mt-1">🎀</span>
        </div>
      );
    case 'cl_dino':
      return (
        <div className="absolute inset-0 rounded-full border-6 border-lime-400/80 z-20 pointer-events-none">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">🦖</div>
        </div>
      );
    case 'cl_vampire':
      return (
        <div className="absolute bottom-0 w-36 h-16 bg-gradient-to-b from-red-950 to-slate-950 rounded-t-3xl border-2 border-red-600 z-20 flex flex-col items-center justify-center">
          <div className="w-8 h-4 bg-white rounded-sm" />
          <span className="text-xs text-red-500 font-bold -mt-0.5">🦇</span>
        </div>
      );
    case 'cl_wizard':
      return (
        <>
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 text-4xl z-30">🧙</div>
          <div className="absolute bottom-1 w-32 h-14 bg-blue-900 rounded-t-3xl border-2 border-amber-300 z-20 flex items-center justify-center">
            <span className="text-amber-300 text-xs">✨ ⭐ ✨</span>
          </div>
        </>
      );
    case 'cl_doctor':
      return (
        <div className="absolute bottom-1 w-32 h-14 bg-white rounded-t-3xl border-2 border-slate-300 shadow-md z-20 flex flex-col items-center justify-center">
          <div className="text-xs">🩺</div>
          <div className="w-3 h-0.5 bg-blue-600 rounded-full" />
        </div>
      );
    case 'cl_chef':
      return (
        <>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl z-30">👨‍🍳</div>
          <div className="absolute bottom-1 w-30 h-12 bg-white rounded-t-3xl border border-slate-300 z-20 flex items-center justify-center">
            <div className="w-4 h-4 bg-red-500 rotate-45 rounded-xs" />
          </div>
        </>
      );
    case 'cl_astronaut':
      return (
        <div className="absolute inset-0 rounded-full border-6 border-slate-200 bg-cyan-200/10 z-20 pointer-events-none flex flex-col items-center justify-between p-1">
          <div className="text-xs font-bold text-slate-700 bg-white px-2 rounded-full border border-slate-300 shadow-xs">
            NASA 🚀
          </div>
        </div>
      );
    case 'cl_santa':
      return (
        <>
          <div className="absolute -top-8 right-6 text-3xl z-30">🎅</div>
          <div className="absolute bottom-1 w-32 h-14 bg-rose-600 rounded-t-3xl border-2 border-white z-20 flex items-center justify-center">
            <div className="w-full h-3 bg-white" />
          </div>
        </>
      );
    case 'cl_tuxedo':
      return (
        <>
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-3xl z-30">🎩</div>
          <div className="absolute bottom-1 w-32 h-14 bg-slate-950 rounded-t-3xl border-2 border-slate-800 z-20 flex flex-col items-center justify-center">
            <div className="w-8 h-4 bg-white rounded-sm flex items-center justify-center">
              <span className="text-[10px] text-slate-950">🎀</span>
            </div>
          </div>
        </>
      );
    case 'cl_ninja':
      return (
        <div className="absolute inset-0 rounded-full border-4 border-slate-950 bg-slate-950/20 z-20 pointer-events-none">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-slate-950 text-[10px] font-bold text-amber-400 rounded-full border border-amber-400">
            忍
          </div>
        </div>
      );
    default:
      // Default cute collar ribbon
      return (
        <div className="absolute bottom-2 w-28 h-10 bg-primary-light/90 rounded-t-2xl border-2 border-primary z-20 flex items-center justify-center">
          <span className="text-xs">✨</span>
        </div>
      );
  }
};

// Scalable High Quality Modern 2D Vector Cartoon Pet Avatar Component
export const PetAvatar: React.FC<{
  type: PetType;
  isEating?: boolean;
  isCheering?: boolean;
  hunger?: number;
  size?: 'sm' | 'md' | 'lg';
  equippedAccessories?: PetAccessory;
}> = ({ type, isEating, isCheering, size = 'lg', equippedAccessories }) => {
  const scale = size === 'sm' ? 0.38 : size === 'md' ? 0.65 : 1.0;
  const containerDimensions =
    size === 'sm' ? 'w-20 h-20' : size === 'md' ? 'w-36 h-36' : 'w-56 h-56';

  return (
    <div
      className={`relative ${containerDimensions} mx-auto flex items-center justify-center select-none overflow-visible`}
    >
      {/* Eating hearts animation */}
      {isEating && (
        <div className="absolute -top-7 flex gap-2 animate-bounce z-30">
          <span className="text-2xl animate-ping">💖</span>
          <span className="text-3xl">✨</span>
          <span className="text-2xl animate-ping">💖</span>
        </div>
      )}

      {/* Main Avatar Scaled Viewport */}
      <div
        style={{ transform: `scale(${scale})` }}
        className={`w-52 h-52 flex-shrink-0 flex items-center justify-center transition-transform duration-300 relative ${
          isCheering ? 'animate-bounce' : isEating ? 'animate-pulse' : ''
        }`}
      >
        {/* 1. MOJI (โมจิ - Mint Sprout Slime) */}
        {type === 'moji' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-emerald-200 via-green-300 to-emerald-400 rounded-[48%_48%_44%_44%] shadow-2xl flex flex-col items-center justify-center border-4 border-white">
            <div className="absolute -top-7 flex items-center justify-center">
              <span className="text-4xl drop-shadow-md">🌱</span>
            </div>
            <div className="absolute top-1/2 -left-3 w-5 h-7 bg-green-300 rounded-full rotate-[-20deg] border-2 border-white" />
            <div className="absolute top-1/2 -right-3 w-5 h-7 bg-green-300 rounded-full rotate-[20deg] border-2 border-white" />
            <div className="flex gap-6 z-10 -mt-2">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative shadow-inner">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
                <div className="w-1.5 h-1.5 bg-white rounded-full absolute bottom-1.5 left-1.5" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative shadow-inner">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
                <div className="w-1.5 h-1.5 bg-white rounded-full absolute bottom-1.5 left-1.5" />
              </div>
            </div>
            <div className="w-4 h-3 bg-red-400 rounded-b-full mt-2 shadow-sm" />
            <div className="absolute bottom-10 left-5 w-6 h-3 bg-pink-300/80 rounded-full" />
            <div className="absolute bottom-10 right-5 w-6 h-3 bg-pink-300/80 rounded-full" />
            <div className="absolute -bottom-1.5 flex gap-12">
              <div className="w-6 h-3.5 bg-emerald-400 rounded-full border border-white" />
              <div className="w-6 h-3.5 bg-emerald-400 rounded-full border border-white" />
            </div>
          </div>
        )}

        {/* 2. BUBBLE (บับเบิ้ล - Blue Water Droplet) */}
        {type === 'bubble' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500 rounded-[50%_50%_44%_44%] shadow-2xl flex flex-col items-center justify-center border-4 border-white">
            <div className="absolute -top-5 w-7 h-7 bg-sky-300 rounded-t-full rotate-45 border-t-2 border-l-2 border-white" />
            <div className="absolute bottom-1 w-24 h-18 bg-white/70 rounded-full flex items-center justify-center" />
            <div className="flex gap-6 z-10 -mt-2">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="w-5 h-3 bg-rose-400 rounded-b-full mt-2 z-10" />
            <div className="absolute top-1/2 -left-4 w-6 h-8 bg-sky-400 rounded-full rotate-[-30deg] border-2 border-white" />
            <div className="absolute top-1/2 -right-4 w-6 h-8 bg-sky-400 rounded-full rotate-[30deg] border-2 border-white" />
          </div>
        )}

        {/* 3. PUI PUI (ปุยปุย - Yellow Chick Dino) */}
        {type === 'puipui' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-400 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white">
            <div className="absolute -top-4 right-10 flex gap-1 rotate-[15deg]">
              <div className="w-4 h-6 bg-amber-500 rounded-t-full" />
              <div className="w-4 h-8 bg-amber-500 rounded-t-full" />
              <div className="w-4 h-6 bg-amber-500 rounded-t-full" />
            </div>
            <div className="flex gap-6 z-10 -mt-1">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="w-4 h-2.5 bg-red-400 rounded-b-full mt-2" />
            <div className="absolute bottom-11 left-6 w-5 h-3 bg-orange-300/80 rounded-full" />
            <div className="absolute bottom-11 right-6 w-5 h-3 bg-orange-300/80 rounded-full" />
          </div>
        )}

        {/* 4. LUNO (ลูโน่ - Purple Horned Devil Bat) */}
        {type === 'luno' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-purple-300 via-purple-400 to-indigo-500 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white">
            <div className="absolute -top-4 left-8 w-5 h-8 bg-purple-700 rounded-t-full rotate-[-25deg]" />
            <div className="absolute -top-4 right-8 w-5 h-8 bg-purple-700 rounded-t-full rotate-[25deg]" />
            <div className="absolute -bottom-2 -right-3 text-2xl rotate-45">💜</div>
            <div className="flex gap-6 z-10 -mt-1">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 z-10">
              <div className="w-2 h-2.5 bg-white rounded-b-sm rotate-12" />
              <div className="w-2 h-2.5 bg-white rounded-b-sm -rotate-12" />
            </div>
            <div className="absolute bottom-11 left-6 w-5 h-3 bg-pink-400/80 rounded-full" />
            <div className="absolute bottom-11 right-6 w-5 h-3 bg-pink-400/80 rounded-full" />
          </div>
        )}

        {/* 5. MILLY (มิลลี่ - Pink Floppy Bunny with Flower) */}
        {type === 'milly' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-pink-200 via-pink-300 to-rose-400 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white">
            <div className="absolute -top-10 left-3 w-9 h-18 bg-pink-300 rounded-full rotate-[-35deg] border-2 border-white" />
            <div className="absolute -top-10 right-3 w-9 h-18 bg-pink-300 rounded-full rotate-[35deg] border-2 border-white" />
            <div className="absolute -top-3 right-5 text-2xl z-20">🌸</div>
            <div className="flex gap-6 z-10 -mt-1">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="w-3 h-2 bg-pink-500 rounded-full mt-1" />
            <div className="absolute bottom-10 left-5 w-6 h-3 bg-rose-400/80 rounded-full" />
            <div className="absolute bottom-10 right-5 w-6 h-3 bg-rose-400/80 rounded-full" />
          </div>
        )}

        {/* 6. CREAMY (ครีมมี่ - Fluffy Sheep with Curled Horns) */}
        {type === 'creamy' && (
          <div className="relative w-48 h-48 bg-amber-50 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-amber-200">
            <div className="absolute top-6 -left-5 text-3xl rotate-[-20deg]">🥐</div>
            <div className="absolute top-6 -right-5 text-3xl rotate-[20deg] scale-x-[-1]">🥐</div>
            <div className="flex gap-6 z-10">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="w-4 h-2 bg-red-400 rounded-b-full mt-1.5" />
            <div className="absolute bottom-10 left-7 w-5 h-3 bg-pink-300/80 rounded-full" />
            <div className="absolute bottom-10 right-7 w-5 h-3 bg-pink-300/80 rounded-full" />
          </div>
        )}

        {/* 7. GONGA (กองก้า - Green Chunky Dino) */}
        {type === 'gonga' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-green-300 via-emerald-400 to-green-500 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white">
            <div className="absolute -top-3 left-10 flex gap-2">
              <div className="w-4 h-6 bg-amber-300 rounded-t-full border border-amber-400" />
              <div className="w-5 h-8 bg-amber-300 rounded-t-full border border-amber-400" />
              <div className="w-4 h-6 bg-amber-300 rounded-t-full border border-amber-400" />
            </div>
            <div className="flex gap-6 z-10 -mt-1">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="w-6 h-3 bg-emerald-600 rounded-b-full mt-1 flex justify-around px-1">
              <div className="w-1.5 h-1.5 bg-white rounded-t-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-t-sm" />
            </div>
            <div className="absolute bottom-10 left-6 w-5 h-3 bg-pink-400/80 rounded-full" />
            <div className="absolute bottom-10 right-6 w-5 h-3 bg-pink-400/80 rounded-full" />
          </div>
        )}

        {/* 8. WINGY (วิงกี้ - White Winged Snow Fox) */}
        {type === 'wingy' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-white via-slate-100 to-sky-100 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-sky-200">
            <div className="absolute -top-7 left-7 w-8 h-12 bg-white rounded-t-2xl rotate-[-20deg] border-2 border-sky-200">
              <div className="w-full h-4 bg-sky-300 rounded-t-xl" />
            </div>
            <div className="absolute -top-7 right-7 w-8 h-12 bg-white rounded-t-2xl rotate-[20deg] border-2 border-sky-200">
              <div className="w-full h-4 bg-sky-300 rounded-t-xl" />
            </div>
            <div className="absolute top-1/2 -left-4 text-3xl">🪽</div>
            <div className="absolute top-1/2 -right-4 text-3xl scale-x-[-1]">🪽</div>
            <div className="flex gap-6 z-10">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="w-2.5 h-2 bg-sky-900 rounded-full mt-1" />
          </div>
        )}

        {/* 9. SHADOW (ชาโดว์ - Charcoal Cat with Forehead Gem) */}
        {type === 'shadow' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-purple-400">
            <div className="absolute -top-6 left-7 w-8 h-10 bg-slate-800 rounded-t-xl rotate-[-25deg] border border-purple-400">
              <div className="w-4 h-5 bg-purple-500/60 rounded-t-lg mx-auto mt-2" />
            </div>
            <div className="absolute -top-6 right-7 w-8 h-10 bg-slate-800 rounded-t-xl rotate-[25deg] border border-purple-400">
              <div className="w-4 h-5 bg-purple-500/60 rounded-t-lg mx-auto mt-2" />
            </div>
            <div className="absolute top-4 w-4 h-6 bg-gradient-to-b from-purple-300 to-fuchsia-500 rotate-45 shadow-[0_0_12px_rgba(192,132,252,0.9)] animate-pulse" />
            <div className="flex gap-6 z-10 mt-3">
              <div className="w-9 h-9 bg-purple-950 rounded-full relative border border-purple-400">
                <div className="w-3.5 h-3.5 bg-purple-200 rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-purple-950 rounded-full relative border border-purple-400">
                <div className="w-3.5 h-3.5 bg-purple-200 rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="w-3 h-1.5 border-b-2 border-purple-300 rounded-full mt-1.5" />
          </div>
        )}

        {/* 10. CITRA (ซิตร้า - Orange Citrus Monster) */}
        {type === 'citra' && (
          <div className="relative w-48 h-48 bg-gradient-to-b from-orange-300 via-amber-400 to-orange-500 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white">
            <div className="absolute -top-6 flex items-center justify-center">
              <div className="w-2 h-4 bg-amber-800 rounded-sm" />
              <span className="text-3xl -ml-2 -mt-2">🍃</span>
            </div>
            <div className="absolute bottom-1 w-26 h-15 bg-amber-100 rounded-t-full border-4 border-amber-300 flex items-center justify-center">
              <div className="w-18 h-9 border-b-2 border-amber-400 border-dashed rounded-b-full opacity-60" />
            </div>
            <div className="flex gap-6 z-10 -mt-2">
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
              <div className="w-9 h-9 bg-slate-950 rounded-full relative">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
            <div className="w-5 h-3 bg-red-500 rounded-b-full mt-1.5 z-10" />
          </div>
        )}

        {/* Fashion Eyewear & Outfit Overlays */}
        <EyewearOverlay glassesId={equippedAccessories?.glasses} />
        <OutfitOverlay outfitId={equippedAccessories?.clothes} />
      </div>
    </div>
  );
};

export const PetSanctuaryPage: React.FC = () => {
  const [pet, setPet] = useState<PetData>(gamificationService.getActivePet());
  const [inventory, setInventory] = useState<Record<string, number>>(
    gamificationService.getInventory()
  );
  const [coins, setCoins] = useState<number>(gamificationService.getCoins());

  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [isSwitchPetOpen, setIsSwitchPetOpen] = useState(false);
  const [isWardrobeModalOpen, setIsWardrobeModalOpen] = useState(false);
  const [wardrobeTab, setWardrobeTab] = useState<'glasses' | 'outfit'>('glasses');

  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [isSportsModalOpen, setIsSportsModalOpen] = useState(false);
  const [trainingType, setTrainingType] = useState<'int' | 'str'>('int');

  const [isEating, setIsEating] = useState(false);
  const [isCheering, setIsCheering] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Training Mini-Game State
  const [trainingQuestions, setTrainingQuestions] = useState<GeneratedGameQuestion[]>([]);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  const refreshState = () => {
    setPet(gamificationService.getActivePet());
    setInventory(gamificationService.getInventory());
    setCoins(gamificationService.getCoins());
  };

  useEffect(() => {
    refreshState();
    const handlePet = () => setPet(gamificationService.getActivePet());
    const handleInv = () => setInventory(gamificationService.getInventory());
    const handleCoins = () => setCoins(gamificationService.getCoins());

    window.addEventListener('wb:pet_updated', handlePet);
    window.addEventListener('wb:inventory_updated', handleInv);
    window.addEventListener('wb:coins_updated', handleCoins);

    return () => {
      window.removeEventListener('wb:pet_updated', handlePet);
      window.removeEventListener('wb:inventory_updated', handleInv);
      window.removeEventListener('wb:coins_updated', handleCoins);
    };
  }, []);

  const handleFeedItem = (itemId: string) => {
    const res = gamificationService.feedPet(itemId);
    if (res.success) {
      setIsEating(true);
      setFeedbackNotice(res.message);
      setTimeout(() => {
        setIsEating(false);
        setFeedbackNotice(null);
      }, 2500);
      setIsFeedModalOpen(false);
    } else {
      setFeedbackNotice(res.message);
      setTimeout(() => setFeedbackNotice(null), 2500);
    }
  };

  const handleEquip = (category: 'glasses' | 'outfit', itemId: string) => {
    const res = gamificationService.equipAccessory(category, itemId);
    if (res.success) {
      setFeedbackNotice(res.message);
      setIsCheering(true);
      setTimeout(() => {
        setIsCheering(false);
        setFeedbackNotice(null);
      }, 2500);
    }
  };

  const handleUnequip = (category: 'glasses' | 'outfit') => {
    gamificationService.unequipAccessory(category);
    setFeedbackNotice(`Unequipped ${category}!`);
    setTimeout(() => setFeedbackNotice(null), 2000);
  };

  const handleSwitchPet = (type: PetType) => {
    const newPet = gamificationService.switchPet(type);
    setPet(newPet);
    setIsSwitchPetOpen(false);
    setIsCheering(true);
    setFeedbackNotice(`Switched active companion to ${newPet.nameTh} (${newPet.name})! 🌟`);
    setTimeout(() => {
      setIsCheering(false);
      setFeedbackNotice(null);
    }, 2500);
  };

  const startTraining = (type: 'int' | 'str') => {
    setTrainingType(type);
    if (type === 'str') {
      setIsSportsModalOpen(true);
    } else {
      setQuizQuestionIndex(0);
      setQuizScore(0);
      const qs = vocabPoolService.getRandomQuestions(5, 'all', 'mixed');
      setTrainingQuestions(qs);
      setIsTrainingOpen(true);
    }
  };

  const handleAnswerTraining = (selected: string) => {
    if (trainingQuestions.length === 0) return;
    const q = trainingQuestions[quizQuestionIndex];
    const isCorrect = selected === q.correctAnswer;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      speakWord(q.audioText, q.audioLang);
    }

    if (quizQuestionIndex + 1 < trainingQuestions.length) {
      setQuizQuestionIndex((prev) => prev + 1);
    } else {
      const points = Math.max(1, isCorrect ? quizScore + 1 : quizScore);
      gamificationService.trainPet(trainingType, points);
      setIsTrainingOpen(false);
      setIsCheering(true);
      setFeedbackNotice(
        `Study Workout Complete! +${points * 2} INT & POWER and +${points * 15} EXP! 🎉`
      );
      setTimeout(() => {
        setIsCheering(false);
        setFeedbackNotice(null);
      }, 3500);
    }
  };

  const currentRosterEntry = PET_ROSTER.find((p) => p.type === pet.type) || PET_ROSTER[0];

  const equippedGlassesItem = FASHION_GLASSES.find(
    (i) => i.id === pet.equippedAccessories?.glasses
  );
  const equippedOutfitItem = FASHION_OUTFITS.find(
    (i) => i.id === pet.equippedAccessories?.clothes
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="noun" size="sm">
              🐾 2D Tamagotchi Sanctuary
            </Badge>
            <span className="text-xs text-text-muted">10 Monster Companions & Wardrobe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-text-primary mt-1">
            {pet.nameTh || pet.name} ({pet.name})'s Sanctuary
          </h1>
          <p className="text-xs text-text-secondary font-sarabun mt-0.5">
            บุคลิก: <span className="font-bold text-primary">{currentRosterEntry.personality}</span>
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/shop"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-yellow-light text-accent-yellow font-bold text-xs border border-accent-yellow/30 shadow-xs"
            title="Coins Balance"
          >
            <span>🪙</span>
            <span>{coins}</span>
          </Link>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsWardrobeModalOpen(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <span>👗</span> ห้องแต่งตัว
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsSwitchPetOpen(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <span>🔄</span> เปลี่ยนสัตว์เลี้ยง
          </Button>

          <Link to="/shop">
            <Button variant="primary" size="md" className="flex items-center gap-1.5 shadow-primary-btn">
              <ShoppingBag className="w-4 h-4" /> ร้านค้า
            </Button>
          </Link>
        </div>
      </div>

      {/* Notice Banner */}
      {feedbackNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fade-in shadow-md">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Main Pet Sanctuary Card */}
      <Card
        className={`p-6 sm:p-10 bg-gradient-to-b ${currentRosterEntry.bgGradient} rounded-3xl border-2 border-white/60 shadow-xl relative overflow-hidden`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: 2D Cartoon Pet & Equipped Accessories */}
          <div className="space-y-4 text-center">
            <PetAvatar
              type={pet.type}
              isEating={isEating}
              isCheering={isCheering}
              hunger={pet.hunger}
              equippedAccessories={pet.equippedAccessories}
            />

            {/* Level & Name Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 shadow-md border border-white/80">
              <span className="text-xl">{currentRosterEntry.icon}</span>
              <span className="font-outfit font-bold text-base text-text-primary">
                {pet.nameTh || pet.name} (Lv.{pet.level})
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-bold">
                {currentRosterEntry.personality}
              </span>
            </div>

            {/* Equipped Accessories Pills */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setWardrobeTab('glasses');
                  setIsWardrobeModalOpen(true);
                }}
                className="text-xs font-bold text-slate-700 bg-white/85 hover:bg-white px-3 py-1 rounded-xl shadow-xs border border-white flex items-center gap-1 transition-all"
              >
                <span>👓 แว่น:</span>
                <span className="text-primary font-bold">
                  {equippedGlassesItem ? equippedGlassesItem.nameTh : 'ไม่มี (ถอดอยู่)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWardrobeTab('outfit');
                  setIsWardrobeModalOpen(true);
                }}
                className="text-xs font-bold text-slate-700 bg-white/85 hover:bg-white px-3 py-1 rounded-xl shadow-xs border border-white flex items-center gap-1 transition-all"
              >
                <span>👗 ชุด:</span>
                <span className="text-primary font-bold">
                  {equippedOutfitItem ? equippedOutfitItem.nameTh : 'ไม่มี (ถอดอยู่)'}
                </span>
              </button>
            </div>
          </div>

          {/* Right: Vitals & Combat Stats */}
          <div className="space-y-5 bg-white/85 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-lg">
            {/* Vitals */}
            <div className="space-y-3">
              <h3 className="font-outfit font-bold text-sm text-text-secondary uppercase tracking-wider">
                Pet Vitals (การดูแล)
              </h3>

              {/* Hunger Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-text-primary">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                    Hunger (ความอิ่ม)
                  </span>
                  <span>{pet.hunger} / 100</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pet.hunger}%` }}
                  />
                </div>
              </div>

              {/* Happiness Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-text-primary">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    Happiness (ความสุข)
                  </span>
                  <span>{pet.happiness} / 100</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pet.happiness}%` }}
                  />
                </div>
              </div>

              {/* EXP Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-bold text-text-primary">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                    EXP to Next Level
                  </span>
                  <span>
                    {pet.exp} / {pet.maxExp}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${(pet.exp / pet.maxExp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Combat Power & RPG Stats */}
            <div className="pt-3 border-t border-border/80">
              <h3 className="font-outfit font-bold text-xs text-text-secondary uppercase tracking-wider mb-2.5">
                Combat Stats (สำหรับ Boss Battle Arena)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-200/60">
                  <p className="text-[11px] font-bold text-orange-700">STR ⚔️</p>
                  <p className="text-lg font-outfit font-bold text-orange-950">{pet.str}</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/60">
                  <p className="text-[11px] font-bold text-emerald-700">AGI ⚡</p>
                  <p className="text-lg font-outfit font-bold text-emerald-950">{pet.agi}</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200/60">
                  <p className="text-[11px] font-bold text-indigo-700">INT 🧠</p>
                  <p className="text-lg font-outfit font-bold text-indigo-950">{pet.intStat}</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200/60">
                  <p className="text-[11px] font-bold text-purple-700">BURST 🔥</p>
                  <p className="text-lg font-outfit font-bold text-purple-950">{pet.power}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Interactive Activity Action Hubs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Feed Food */}
        <Card className="p-5 flex flex-col justify-between space-y-4 hover:border-amber-400 hover:shadow-card transition-all">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
              🍖
            </div>
            <h3 className="font-outfit font-bold text-base text-text-primary">ให้อาหาร (Feed)</h3>
            <p className="text-xs text-text-secondary">
              ป้อนอาหารโปรด ผลไม้ และยาเวทมนตร์เพื่อฟื้นฟูพลัง
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFeedModalOpen(true)}
            className="w-full justify-between"
          >
            <span>Open Meals</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>

        {/* 2. Wardrobe Dressing Room */}
        <Card className="p-5 flex flex-col justify-between space-y-4 hover:border-purple-400 hover:shadow-card transition-all">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">
              👗
            </div>
            <h3 className="font-outfit font-bold text-base text-text-primary">
              แต่งตัว (Wardrobe)
            </h3>
            <p className="text-xs text-text-secondary">
              ใส่แว่นตา 20 แบบ และชุดคอสตูม 20 แบบเพิ่มสเตตัส
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsWardrobeModalOpen(true)}
            className="w-full justify-between"
          >
            <span>Open Wardrobe</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>

        {/* 3. Study Training */}
        <Card className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-400 hover:shadow-card transition-all">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
              📚
            </div>
            <h3 className="font-outfit font-bold text-base text-text-primary">
              ฝึกสมอง (Study)
            </h3>
            <p className="text-xs text-text-secondary">
              ทบทวนคำศัพท์ด่วน 5 ข้อ เพื่อเพิ่ม <b>INT & POWER</b>
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => startTraining('int')}
            className="w-full justify-between"
          >
            <span>Start Study</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>

        {/* 4. Sports Training (Arcade Mini-Games) */}
        <Card className="p-5 flex flex-col justify-between space-y-4 hover:border-emerald-400 hover:shadow-card transition-all">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
              ⚽
            </div>
            <h3 className="font-outfit font-bold text-base text-text-primary">
              กีฬาอาเขต (Sports)
            </h3>
            <p className="text-xs text-text-secondary">
              ชู้ตบาส, ปาเป้า, ดวลจุดโทษแข่งกับบอท เพิ่ม <b>STR & AGI</b>
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => startTraining('str')}
            className="w-full justify-between"
          >
            <span>Play Sports</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>

      {/* Modal: Feed Items from Inventory */}
      {isFeedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsFeedModalOpen(false)}
        >
          <Card
            className="w-full max-w-lg p-5 sm:p-8 space-y-5 shadow-2xl relative my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-xl font-outfit font-bold text-text-primary">
                  Feed {pet.nameTh || pet.name} 🍖
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  เลือกไอเทมจากช่องเก็บของเพื่อป้อนสัตว์เลี้ยง
                </p>
              </div>
              <button
                onClick={() => setIsFeedModalOpen(false)}
                className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-surface-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {Object.keys(inventory).length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <p className="text-3xl">🎒</p>
                <p className="text-sm font-semibold text-text-secondary">
                  ไม่มีอาหารในช่องเก็บของเลย!
                </p>
                <Link to="/shop">
                  <Button variant="primary" size="md">
                    ไปที่ร้านค้า 🛍️
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {Object.entries(inventory).map(([itemId, count]) => {
                  const item = SHOP_ITEMS.find((i) => i.id === itemId && (i.type === 'food' || i.type === 'potion'));
                  if (!item || count <= 0) return null;

                  return (
                    <div
                      key={itemId}
                      className="p-3.5 rounded-2xl border border-border bg-white flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <p className="font-outfit font-bold text-sm text-text-primary">
                            {item.nameTh} ({item.name})
                          </p>
                          <p className="text-xs text-text-secondary">Owned: {count} pcs</p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleFeedItem(itemId)}
                      >
                        Feed 🍖
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Link to="/shop">
                <Button variant="secondary" size="sm">
                  <ShoppingBag className="w-4 h-4 mr-1" /> ไปซื้อของเพิ่ม
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setIsFeedModalOpen(false)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Wardrobe & Dress Up (20 Glasses & 20 Outfits) */}
      {isWardrobeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setIsWardrobeModalOpen(false)}
        >
          <Card
            className="w-full max-w-4xl p-0 shadow-2xl relative my-auto max-h-[calc(100dvh-2rem)] flex flex-col bg-white overflow-hidden border-2 border-purple-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-purple-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-200 text-purple-700 flex items-center justify-center text-xl shadow-xs flex-shrink-0">
                  👗
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-outfit font-bold text-text-primary">
                    Pet Wardrobe (ห้องแต่งตัวสัตว์เลี้ยง)
                  </h3>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 font-sarabun">
                    สวมใส่แว่นตาและชุดเสื้อผ้าแฟชั่นเพื่อเพิ่มสเตตัสให้ {pet.nameTh || pet.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWardrobeModalOpen(false)}
                className="p-2 sm:p-2.5 text-text-secondary hover:text-text-primary rounded-2xl bg-white hover:bg-surface-elevated border border-border transition-all active:scale-95 flex-shrink-0 ml-2"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-slate-50 border-b border-border overflow-x-auto touch-pan-x flex-wrap">
              <button
                type="button"
                onClick={() => setWardrobeTab('glasses')}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  wardrobeTab === 'glasses'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-text-secondary border border-border hover:bg-slate-100'
                }`}
              >
                👓 แว่นตาแฟชั่น (20 แบบ)
              </button>
              <button
                type="button"
                onClick={() => setWardrobeTab('outfit')}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  wardrobeTab === 'outfit'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-text-secondary border border-border hover:bg-slate-100'
                }`}
              >
                👗 ชุดเสื้อผ้าคอสตูม (20 แบบ)
              </button>

              <div className="ml-auto">
                <Link to="/shop">
                  <Button variant="secondary" size="sm" className="h-8 text-xs">
                    <ShoppingBag className="w-3.5 h-3.5 mr-1" /> ร้านค้า
                  </Button>
                </Link>
              </div>
            </div>

            {/* Wardrobe Items Grid */}
            <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {(wardrobeTab === 'glasses' ? FASHION_GLASSES : FASHION_OUTFITS).map((item, idx) => {
                  const owned = (inventory[item.id] || 0) > 0;
                  const isEquipped =
                    wardrobeTab === 'glasses'
                      ? pet.equippedAccessories?.glasses === item.id
                      : pet.equippedAccessories?.clothes === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`relative p-3 rounded-2xl border-2 text-center flex flex-col justify-between gap-2 transition-all ${
                        isEquipped
                          ? 'border-purple-600 bg-purple-50/80 ring-4 ring-purple-200 shadow-md'
                          : owned
                          ? 'border-border bg-white hover:border-purple-300'
                          : 'border-dashed border-slate-200 bg-slate-50/60 opacity-60'
                      }`}
                    >
                      {/* Number Pill */}
                      <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center">
                        {idx + 1}
                      </span>

                      {isEquipped && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-600 text-[9px] font-bold text-white shadow-xs">
                          Equipped
                        </span>
                      )}

                      {/* Icon */}
                      <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center text-3xl shadow-xs border border-slate-100 mt-2">
                        {item.icon}
                      </div>

                      {/* Details */}
                      <div>
                        <p className="font-outfit font-bold text-xs text-text-primary">
                          {item.nameTh}
                        </p>
                        <p className="text-[10px] text-text-muted">{item.name}</p>
                        <p className="text-[10px] text-purple-700 font-bold mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="pt-1">
                        {isEquipped ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnequip(wardrobeTab)}
                            className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            ถอดออก (Unequip)
                          </Button>
                        ) : owned ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEquip(wardrobeTab, item.id)}
                            className="w-full text-xs bg-purple-600 hover:bg-purple-700"
                          >
                            <Check className="w-3 h-3 mr-1" /> สวมใส่ (Equip)
                          </Button>
                        ) : (
                          <Link to="/shop">
                            <Button variant="secondary" size="sm" className="w-full text-[11px]">
                              🪙 {item.price} ซื้อ
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-text-muted font-sarabun">
                คลิกปุ่มสวมใส่เพื่อแต่งตัวสัตว์เลี้ยงได้ทันที ✨
              </span>
              <Button variant="secondary" size="sm" onClick={() => setIsWardrobeModalOpen(false)}>
                ปิดหน้าต่าง (Close)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Switch Companion (All 10 Pets) */}
      {isSwitchPetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setIsSwitchPetOpen(false)}
        >
          <Card
            className="w-full max-w-4xl p-0 shadow-2xl relative my-auto max-h-[calc(100dvh-2rem)] flex flex-col bg-white overflow-hidden border-2 border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-xl shadow-xs flex-shrink-0">
                  🐾
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-outfit font-bold text-text-primary">
                    Choose Your Companion (เลือกสัตว์เลี้ยง 10 แบบ)
                  </h3>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 font-sarabun">
                    เลือกคู่หูตัวโปรดเพื่อร่วมฝึกฝนและผจญภัยสู้บอส
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSwitchPetOpen(false)}
                className="p-2 sm:p-2.5 text-text-secondary hover:text-text-primary rounded-2xl bg-white hover:bg-surface-elevated border border-border transition-all active:scale-95 flex-shrink-0 ml-2"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pets Grid */}
            <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
                {PET_ROSTER.map((p, idx) => {
                  const isSelected = pet.type === p.type;

                  return (
                    <button
                      key={p.type}
                      type="button"
                      onClick={() => handleSwitchPet(p.type)}
                      className={`relative p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-between gap-2 transition-all duration-200 group ${
                        isSelected
                          ? 'border-primary bg-primary-light/40 ring-4 ring-primary/20 shadow-lg scale-[1.03]'
                          : 'border-border bg-white hover:border-primary/50 hover:shadow-md hover:bg-slate-50'
                      }`}
                    >
                      <span className="absolute top-2 left-2.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold font-outfit text-slate-700 flex items-center justify-center">
                        {idx + 1}
                      </span>

                      {isSelected && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-primary text-[9px] font-bold text-white shadow-xs">
                          Active
                        </span>
                      )}

                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b ${p.bgGradient} flex items-center justify-center border border-white shadow-inner overflow-hidden mt-3`}
                      >
                        <PetAvatar type={p.type} size="sm" />
                      </div>

                      <div className="w-full space-y-0.5">
                        <p className="font-outfit font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
                          {p.nameTh}
                        </p>
                        <p className="text-[11px] text-text-muted font-outfit">{p.name}</p>
                        <div className="pt-0.5">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-elevated text-primary font-sarabun">
                            {p.personality}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-1 pt-1 text-xs opacity-75">
                        <span>{p.hatIcon}</span>
                        <span>{p.glassesIcon}</span>
                        <span>{p.clothesIcon}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-text-muted font-sarabun">
                คลิกที่ตัวละครที่ต้องการเพื่อเปลี่ยนคู่หูทันที ✨
              </span>
              <Button variant="secondary" size="sm" onClick={() => setIsSwitchPetOpen(false)}>
                ปิดหน้าต่าง (Close)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Interactive Study Mini-Quiz */}
      {isTrainingOpen && trainingQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Badge variant="verb" size="md">
                🧠 INT Study Training
              </Badge>
              <span className="text-xs font-bold text-text-muted">
                Question {quizQuestionIndex + 1} / {trainingQuestions.length}
              </span>
            </div>

            <div className="space-y-2 py-4">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary-light text-primary uppercase tracking-wider">
                {trainingQuestions[quizQuestionIndex]?.mode === 'en_to_th'
                  ? '🇺🇸 English ➔ 🇹🇭 แปลไทย'
                  : '🇹🇭 ภาษาไทย ➔ 🇺🇸 แปลอังกฤษ'}
              </span>
              <div className="flex items-center justify-center gap-2 pt-2">
                <h3 className="text-3xl font-outfit font-bold text-primary">
                  {trainingQuestions[quizQuestionIndex]?.questionPrompt}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    speakWord(
                      trainingQuestions[quizQuestionIndex]?.audioText,
                      trainingQuestions[quizQuestionIndex]?.audioLang
                    )
                  }
                  className="p-2 rounded-xl bg-primary-light text-primary hover:bg-primary/20 transition-colors"
                  title="Listen Pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              {trainingQuestions[quizQuestionIndex]?.subPrompt && (
                <p className="text-xs text-text-secondary font-sarabun">
                  {trainingQuestions[quizQuestionIndex]?.subPrompt}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {trainingQuestions[quizQuestionIndex]?.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswerTraining(opt)}
                  className="p-3.5 rounded-2xl border-2 border-border bg-white hover:border-primary hover:bg-primary-light font-sarabun font-bold text-sm text-text-primary transition-all active:scale-95 shadow-sm"
                >
                  {opt}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTrainingOpen(false)}
              className="mt-4"
            >
              Quit Training
            </Button>
          </Card>
        </div>
      )}

      {/* Modal: 3-Game Sports Arcade League */}
      <SportsArcadeModal
        isOpen={isSportsModalOpen}
        onClose={() => setIsSportsModalOpen(false)}
        pet={pet}
      />
    </div>
  );
};
