import { cn } from '@/lib/utils'
import React from 'react'

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  variant?: 'filled' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles = {
  filled: 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95',
  outline: 'border border-border text-foreground hover:bg-muted active:bg-muted',
  ghost: 'text-foreground hover:bg-muted active:bg-muted/80',
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-base rounded-xl',
  lg: 'px-6 py-4 text-base rounded-2xl',
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      children,
      icon,
      variant = 'filled',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="material-symbols-outlined animate-spin text-[20px]">
            progress_activity
          </span>
        ) : (
          icon && <span className="text-[20px]">{icon}</span>
        )}
        {children}
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'
