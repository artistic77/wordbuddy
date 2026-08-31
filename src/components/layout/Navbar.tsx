import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShieldCheck, Target, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { DailyMissionsModal } from '../gamification/DailyMissionsModal';
import { UserGuideModal } from '../guide/UserGuideModal';
import { gamificationService } from '../../services/gamificationService';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const [coins, setCoins] = useState<number>(gamificationService.getCoins());
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const handleCoins = () => setCoins(gamificationService.getCoins());
    window.addEventListener('wb:coins_updated', handleCoins);
    return () => window.removeEventListener('wb:coins_updated', handleCoins);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'My Sets', path: '/sets' },
    { label: '🐾 Pet', path: '/pet' },
    { label: '🛍️ Shop', path: '/shop' },
    { label: '⚔️ Arena', path: '/battle' },
    { label: 'Explore', path: '/explore' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center p-1 transition-transform group-hover:scale-105">
            <img src="/owl-icon.svg" alt="Word Buddy Mascot" className="w-8 h-8" />
          </div>
          <div>
            <span className="font-outfit font-bold text-xl text-primary tracking-tight">Word Buddy</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-red-50 text-secondary border border-secondary/20'
                  : 'text-text-secondary hover:text-secondary hover:bg-red-50/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* User / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Guide Button (Always visible) */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs border border-amber-200/80 shadow-sm transition-all active:scale-95"
            title="เปิดคู่มือการใช้งาน (User Guide)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">คู่มือ</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Daily Missions Trigger Button */}
              <button
                type="button"
                onClick={() => setIsMissionsOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200/60 shadow-sm transition-all active:scale-95"
                title="Open Daily Missions"
              >
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Missions</span>
              </button>

              {/* Coins Counter Badge */}
              <Link
                to="/shop"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-yellow-light text-accent-yellow border border-accent-yellow/30 rounded-xl font-bold text-xs shadow-sm hover:scale-105 transition-transform"
                title="Coins Balance (Click to open shop)"
              >
                <span>🪙</span>
                <span>{coins}</span>
              </Link>

              {/* User Avatar */}
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full hover:bg-surface border border-border transition-colors"
              >
                <span className="hidden sm:inline text-xs font-semibold text-text-primary">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
                {profile?.role === 'admin' ? (
                  <Badge variant="admin" size="sm">Admin</Badge>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light rounded-btn transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-btn shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Daily Missions Modal */}
      <DailyMissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </header>
  );
};
