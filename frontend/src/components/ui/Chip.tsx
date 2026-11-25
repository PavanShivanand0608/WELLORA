import React from 'react'

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement | HTMLButtonElement> {
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export default function Chip({
  selected = false,
  onClick,
  disabled = false,
  className = '',
  children,
  ...props
}: ChipProps) {
  const isClickable = Boolean(onClick) && !disabled

  const stateStyles = selected
    ? 'bg-accent text-ink font-semibold shadow-xs border-accent'
    : 'bg-surface text-muted hover:text-ink hover:bg-sand/30 border-line'

  const interactiveStyles = isClickable
    ? 'cursor-pointer select-none active:scale-[0.97] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
    : 'cursor-default'

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''

  if (isClickable || onClick) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`inline-flex items-center justify-center px-3.5 py-1.5 text-xs rounded-full border transition-colors ${stateStyles} ${interactiveStyles} ${disabledStyles} ${className}`.trim()}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-3.5 py-1.5 text-xs rounded-full border ${stateStyles} ${interactiveStyles} ${disabledStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}
