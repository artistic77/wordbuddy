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
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
      secondary: 'bg-primary-light text-primary hover:bg-indigo-100/80 border border-primary/20',
      danger: 'bg-transparent text-danger border border-danger/40 hover:bg-danger-light hover:border-danger shadow-none',
      ghost: 'bg-transparent text-text-primary hover:bg-surface-subtle hover:text-primary',
      success: 'bg-success text-white hover:bg-success-hover shadow-sm',
      warning: 'bg-warning text-white hover:bg-warning-hover shadow-sm',
    };

    const sizes = {
      sm: 'min-h-[44px] px-3.5 text-xs rounded-btn gap-1.5',
      md: 'min-h-[44px] h-11 px-5 text-sm rounded-btn gap-2',
      lg: 'min-h-[48px] h-12 px-6 text-base rounded-btn gap-2.5',
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
