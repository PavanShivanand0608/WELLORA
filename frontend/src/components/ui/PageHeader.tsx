import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  action?: ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  badge,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-line ${className}`.trim()}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink font-sans">
            {title}
          </h1>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-soft text-ink border border-accent/30">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted max-w-2xl font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center gap-2.5">{action}</div>}
    </div>
  )
}
