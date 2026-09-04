import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Compass, Swords, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      exact: true,
    },
    {
      label: 'My Sets',
      path: '/sets',
      icon: BookOpen,
      requiresAuth: true,
    },
    {
      label: 'Pet',
      path: '/pet',
      icon: Heart,
      requiresAuth: true,
    },
    {
      label: 'Arena',
      path: '/battle',
      icon: Swords,
      requiresAuth: true,
    },
    {
      label: 'Explore',
      path: '/explore',
      icon: Compass,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          const destination = item.requiresAuth && !user ? '/auth/login' : item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={destination}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-90 select-none ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-primary-light text-primary shadow-xs' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[11px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
