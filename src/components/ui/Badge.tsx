import React from 'react';
import { cn } from '../../lib/utils';
import type { PartOfSpeech } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'noun' | 'verb' | 'adj' | 'adv' | 'other' | 'admin' | 'user' | 'active' | 'suspended' | 'default';
  pos?: PartOfSpeech;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  pos,
  size = 'md',
  children,
  ...props
}) => {
  // Determine variant from pos if provided
  const activeVariant = variant || (pos as string) || 'default';

  const variants: Record<string, string> = {
    // POS Badges
    noun: 'bg-[#EEF0FF] text-[#6C63FF] border-[#6C63FF]/20',
    verb: 'bg-[#FFF3E0] text-[#F59E0B] border-[#F59E0B]/20',
    adj: 'bg-[#E8FFF3] text-[#06D6A0] border-[#06D6A0]/20',
    adv: 'bg-[#FFF0F0] text-[#FF6B6B] border-[#FF6B6B]/20',
    gerund: 'bg-[#F3E8FF] text-[#9333EA] border-[#9333EA]/20',
    past_participle: 'bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/20',
    other: 'bg-gray-100 text-gray-700 border-gray-200',

    // Role Badges
    admin: 'bg-[#FFE9E9] text-[#DC2626] border-[#DC2626]/20 font-semibold',
    user: 'bg-[#F0F0FF] text-[#6C63FF] border-[#6C63FF]/20',

    // Status Badges
    active: 'bg-[#E8FFF3] text-[#059669] border-[#059669]/20',
    suspended: 'bg-[#FFF0F0] text-[#DC2626] border-[#DC2626]/20',

    default: 'bg-primary-light text-primary border-primary/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border transition-colors',
        variants[activeVariant] || variants.default,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
