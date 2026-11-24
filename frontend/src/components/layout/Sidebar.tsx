import {
  Activity,
  CirclePlus,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sprout,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { IconButton } from '../ui'
import { cn } from '../ui/styles'

type SidebarMode = 'desktop' | 'drawer'

interface SidebarProps {
  mode: SidebarMode
  onNavigate?: () => void
  onClose?: () => void
}

const navigationItems: Array<{
  label: string
  to: string
  icon: LucideIcon
}> = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Meal Log', to: '/meals', icon: Utensils },
  { label: 'Quick Log', to: '/quick-log', icon: CirclePlus },
  { label: 'Patterns', to: '/patterns', icon: Activity },
  { label: 'Recommendations', to: '/recommendations', icon: Lightbulb },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Sidebar({ mode, onClose, onNavigate }: SidebarProps) {
  const isDrawer = mode === 'drawer'

  return (
    <aside
      id={isDrawer ? 'mobile-sidebar' : 'app-sidebar'}
      aria-label="Main navigation"
      className={cn(
        'fixed inset-y-0 left-0 flex flex-col border-r border-line bg-surface',
        isDrawer
          ? 'z-[60] w-72 shadow-phone md:hidden'
          : 'z-40 hidden w-20 md:flex lg:w-64',
      )}
    >
      <div
        className={cn(
          'flex h-20 shrink-0 items-center border-b border-line',
          isDrawer
            ? 'justify-between px-5'
            : 'justify-center px-3 lg:justify-start lg:px-5',
        )}
      >
        <Link
          to="/dashboard"
          aria-label="WELLORA dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3 rounded-tile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-ink">
            <Sprout aria-hidden="true" className="size-5" />
          </span>
          <span
            className={cn(
              'text-sm font-bold tracking-[0.18em] text-ink',
              !isDrawer && 'hidden lg:inline',
            )}
          >
            WELLORA
          </span>
        </Link>
        {isDrawer ? (
          <IconButton
            aria-label="Close navigation"
            buttonSize="md"
            icon={X}
            onClick={onClose}
            type="button"
            variant="light"
          />
        ) : null}
      </div>

      <nav aria-label="Application" className="flex-1 space-y-1 px-3 py-5">
        {navigationItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end
            aria-label={label}
            title={label}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex min-h-12 items-center gap-3 rounded-tile px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                !isDrawer && 'md:justify-center md:px-0 lg:justify-start lg:px-3',
                isActive
                  ? 'bg-accent-soft text-ink'
                  : 'text-muted hover:bg-cream hover:text-ink',
              )
            }
          >
            <Icon aria-hidden="true" className="size-5 shrink-0" />
            <span className={cn(!isDrawer && 'md:hidden lg:inline')}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div
        className={cn(
          'border-t border-line px-4 py-4 text-[11px] leading-relaxed text-muted',
          !isDrawer && 'hidden lg:block',
        )}
      >
        Not medical advice; patterns are associations, not causes.
      </div>
    </aside>
  )
}

export default Sidebar
