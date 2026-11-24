import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn, focusVisibleClasses } from './styles'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  selected?: boolean
  icon?: LucideIcon
}

export function Chip({
  children,
  className,
  disabled,
  icon: Icon,
  selected = false,
  type = 'button',
  ...props
}: ChipProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'border-accent bg-accent-soft text-ink'
          : 'border-line bg-surface text-ink hover:border-sand hover:bg-cream',
        focusVisibleClasses,
        className,
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
      {children}
    </button>
  )
}

export default Chip
