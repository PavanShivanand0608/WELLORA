import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './styles'

export type BadgeVariant =
  | 'neutral'
  | 'regular'
  | 'unplanned'
  | 'low'
  | 'high'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-line text-ink',
  regular: 'bg-sand text-ink',
  unplanned: 'bg-accent-soft text-ink',
  low: 'bg-cream text-panel',
  high: 'bg-accent text-ink',
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
