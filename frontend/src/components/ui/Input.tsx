import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from './styles'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'> {
  label: string
  error?: string
  leadingIcon?: LucideIcon
  trailingAction?: ReactNode
  variant?: 'dark' | 'light'
  className?: string
  inputClassName?: string
}

export function Input({
  className,
  disabled,
  error,
  id,
  inputClassName,
  label,
  leadingIcon: LeadingIcon,
  trailingAction,
  variant = 'dark',
  ...inputProps
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const {
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    ...nativeProps
  } = inputProps
  const errorId = `${inputId}-error`
  const inputDescription = [describedBy, error ? errorId : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cn('grid gap-2', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'text-sm font-medium',
          variant === 'dark'
            ? disabled
              ? 'text-muted'
              : 'text-surface'
            : 'text-ink',
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          'flex min-h-12 items-center gap-3 rounded-tile border px-3 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent',
          variant === 'dark'
            ? 'border-muted bg-panel text-surface'
            : 'border-line bg-surface text-ink',
          error && 'border-accent',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        {LeadingIcon ? (
          <LeadingIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted"
          />
        ) : null}
        <input
          {...nativeProps}
          id={inputId}
          disabled={disabled}
          aria-describedby={inputDescription || undefined}
          aria-invalid={error ? true : ariaInvalid}
          className={cn(
            'min-w-0 flex-1 border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:text-muted',
            variant === 'dark' ? 'text-surface' : 'text-ink',
            inputClassName,
          )}
        />
        {trailingAction}
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className={cn('text-sm', variant === 'dark' ? 'text-accent' : 'text-panel')}
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default Input
