import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../ui/styles'

export interface PhoneFrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function PhoneFrame({
  'aria-label': ariaLabel = 'Phone preview',
  children,
  className,
  role = 'group',
  ...props
}: PhoneFrameProps) {
  return (
    <div
      {...props}
      role={role}
      aria-label={ariaLabel}
      className={cn(
        'relative mx-auto aspect-[14/29] w-full max-w-[280px] rounded-[42px] border border-line/60 bg-panel p-[9px] shadow-phone',
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-line/70 bg-screen">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-2.5 z-20 flex h-5 w-[92px] -translate-x-1/2 items-center justify-end gap-2 rounded-full bg-panel px-3"
        >
          <span className="h-1 w-6 rounded-full bg-muted/60" />
          <span className="size-2 rounded-full bg-muted/70 ring-1 ring-ink/50" />
        </div>
        <div className="h-full overflow-y-auto overscroll-contain px-4 pb-4 pt-10">
          {children}
        </div>
      </div>
    </div>
  )
}

export default PhoneFrame
