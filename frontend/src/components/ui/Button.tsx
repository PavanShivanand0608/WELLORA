import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'accent' | 'sand' | 'light'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children?: React.ReactNode
  className?: string
}

export default function Button({
  variant = 'dark',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantStyles = {
    dark: 'bg-panel text-cream hover:bg-ink active:bg-ink/90 active:scale-[0.98] border border-transparent shadow-sm',
    accent: 'bg-accent text-ink hover:opacity-90 active:scale-[0.98] border border-transparent shadow-sm font-medium',
    sand: 'bg-sand text-ink hover:bg-sand/80 active:scale-[0.98] border border-line',
    light: 'bg-surface text-ink hover:bg-screen active:bg-sand/30 border border-line shadow-xs',
  }[variant]

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[50px]',
  }[size]

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center font-sans font-medium rounded-tile cursor-pointer select-none transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles} ${sizeStyles} ${className}`.trim()}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}
