import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './styles'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn('rounded-card bg-surface p-5 shadow-soft sm:p-6', className)}
    >
      {children}
    </div>
  )
}

export default Card
