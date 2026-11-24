import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle, type LucideIcon } from 'lucide-react'
import {
  buttonBaseClasses,
  buttonVariantClasses,
  cn,
  focusVisibleClasses,
  type ButtonVariant,
} from './styles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'leading' | 'trailing'
}

export function Button({
  children,
  className,
  disabled,
  icon: Icon,
  iconPosition = 'leading',
  loading = false,
  type = 'button',
  variant = 'dark',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonBaseClasses,
        buttonVariantClasses[variant],
        focusVisibleClasses,
        className,
      )}
    >
      {loading ? (
        <LoaderCircle
          aria-hidden="true"
          className="size-4 motion-safe:animate-spin"
        />
      ) : Icon && iconPosition === 'leading' ? (
        <Icon aria-hidden="true" className="size-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'trailing' ? (
        <Icon aria-hidden="true" className="size-4 shrink-0" />
      ) : null}
    </button>
  )
}

export default Button
