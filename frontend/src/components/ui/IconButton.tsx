import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  buttonVariantClasses,
  cn,
  focusVisibleClasses,
  type ButtonVariant,
} from './styles'

export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  icon: LucideIcon
  variant?: ButtonVariant
  buttonSize?: IconButtonSize
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-9',
  md: 'size-11',
  lg: 'size-12',
}

const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-5',
}

export function IconButton({
  'aria-label': ariaLabel,
  buttonSize = 'md',
  className,
  disabled,
  icon: Icon,
  type = 'button',
  variant = 'light',
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full transition-colors duration-150 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[buttonSize],
        buttonVariantClasses[variant],
        focusVisibleClasses,
        className,
      )}
    >
      <Icon aria-hidden="true" className={iconSizeClasses[buttonSize]} />
    </button>
  )
}

export default IconButton
