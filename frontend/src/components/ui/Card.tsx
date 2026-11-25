import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'screen' | 'panel' | 'sand'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children?: React.ReactNode
  className?: string
}

export default function Card({
  variant = 'surface',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    surface: 'bg-surface text-ink border border-line',
    screen: 'bg-screen text-ink border border-line',
    panel: 'bg-panel text-cream border border-neutral-800',
    sand: 'bg-sand/40 text-ink border border-line',
  }[variant]

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding]

  return (
    <div
      className={`rounded-card shadow-soft transition-all duration-200 ${variantStyles} ${paddingStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}
