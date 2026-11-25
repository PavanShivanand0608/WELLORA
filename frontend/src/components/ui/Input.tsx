import React, { forwardRef, useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'panel' | 'surface'
  className?: string
  containerClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'panel',
      id,
      disabled,
      className = '',
      containerClassName = '',
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const variantStyles = {
      panel:
        'bg-panel text-cream placeholder:text-muted border-neutral-700 focus:border-accent focus:ring-accent/30',
      surface:
        'bg-surface text-ink placeholder:text-muted border-line focus:border-accent focus:ring-accent/30',
    }[variant]

    const labelStyles = variant === 'panel' ? 'text-cream' : 'text-ink'

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`.trim()}>
        {label && (
          <label
            htmlFor={inputId}
            className={`text-xs font-medium tracking-wide ${labelStyles} ${
              disabled ? 'opacity-50' : ''
            }`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`w-full px-4 py-3 rounded-tile border text-sm font-sans transition-all duration-150 outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-accent ring-1 ring-accent' : ''
            } ${variantStyles} ${className}`.trim()}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-accent font-medium mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-muted mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
