import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-primary-btn',
      secondary: 'bg-primary-light text-primary hover:bg-primary-light/80',
      danger: 'bg-secondary text-white hover:bg-secondary-hover shadow-sm',
      ghost: 'bg-transparent text-primary hover:bg-primary-light/50 border border-primary/30 hover:border-primary',
      success: 'bg-accent-green text-white hover:bg-accent-emerald shadow-sm',
      warning: 'bg-accent-yellow text-text-primary hover:bg-accent-yellow/90 shadow-sm',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs rounded-btn gap-1.5',
      md: 'h-12 px-5 text-[15px] rounded-btn gap-2',
      lg: 'h-14 px-7 text-base rounded-btn gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
