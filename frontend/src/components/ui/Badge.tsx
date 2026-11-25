import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'regular' | 'unplanned' | 'success' | 'warning' | 'neutral'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export default function Badge({
  variant = 'neutral',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    regular: 'bg-sand text-ink border-line font-medium',
    unplanned: 'bg-accent-soft text-ink border-accent/60 font-semibold',
    success: 'bg-surface text-ink border-line font-medium',
    warning: 'bg-accent text-ink border-accent font-semibold',
    neutral: 'bg-screen text-muted border-line font-normal',
  }[variant]

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-normal',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles} ${sizeStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}
