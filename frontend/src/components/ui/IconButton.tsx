import React from 'react'
import type { LucideIcon } from 'lucide-react'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  'aria-label': string
  variant?: 'surface' | 'sand' | 'dark' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
  className?: string
}

export default function IconButton({
  icon: Icon,
  'aria-label': ariaLabel,
  variant = 'surface',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}: IconButtonProps) {
  const variantStyles = {
    surface: 'bg-surface text-ink hover:bg-screen active:bg-sand/30 border border-line shadow-xs',
    sand: 'bg-sand/60 text-ink hover:bg-sand active:scale-95 border border-line',
    dark: 'bg-panel text-cream hover:bg-neutral-800 active:bg-neutral-900 border border-transparent shadow-xs',
    accent: 'bg-accent text-ink hover:opacity-90 active:scale-95 border border-transparent shadow-xs',
    ghost: 'bg-transparent text-ink hover:bg-sand/30 active:bg-sand/50 border border-transparent',
  }[variant]

  const sizeStyles = {
    sm: 'w-9 h-9 p-1.5 rounded-tile',
    md: 'w-11 h-11 p-2.5 rounded-tile',
    lg: 'w-12 h-12 p-3 rounded-tile',
  }[size]

  const iconSizes = {
    sm: 18,
    md: 20,
    lg: 22,
  }[size]

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={`inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles} ${sizeStyles} ${className}`.trim()}
      {...props}
    >
      {Icon ? <Icon size={iconSizes} aria-hidden="true" /> : children}
    </button>
  )
}
