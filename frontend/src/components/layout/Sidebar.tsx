import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Zap,
  LineChart,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../lib/auth'

export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Meal Log',
    path: '/meals',
    icon: UtensilsCrossed,
  },
  {
    name: 'Quick Log',
    path: '/quick-log',
    icon: Zap,
    badge: 'Quick',
  },
  {
    name: 'Patterns',
    path: '/patterns',
    icon: LineChart,
  },
  {
    name: 'Recommendations',
    path: '/recommendations',
    icon: Sparkles,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="hidden lg:flex w-64 h-screen sticky top-0 bg-panel text-cream flex-col justify-between p-5 border-r border-neutral-800 z-30 select-none shrink-0"
    >
      {/* Brand & Logo Header */}
      <div>
        <div className="flex items-center gap-2 px-3 py-2 mb-8">
          <div className="w-8 h-8 rounded-tile bg-accent flex items-center justify-center text-ink font-black text-lg shadow-sm">
            W
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-cream">WELLORA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </div>
            <span className="text-[10px] text-muted font-medium block leading-none">
              Nutrition & Wellness
            </span>
          </div>
        </div>

        {/* Navigation Destination Links */}
        <nav aria-label="Main Navigation" className="space-y-1.5">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-tile text-sm transition-all duration-150 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'bg-accent-soft text-ink font-bold shadow-xs'
                      : 'text-cream/80 hover:text-cream hover:bg-neutral-800/80 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`transition-colors shrink-0 ${
                          isActive ? 'text-ink' : 'text-muted group-hover:text-cream'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-accent text-ink'
                            : 'bg-neutral-800 text-accent group-hover:bg-neutral-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* User Profile Card & Sign Out Action */}
      <div className="pt-4 border-t border-neutral-800">
        <div className="flex items-center justify-between p-2 rounded-tile bg-neutral-900/80 border border-neutral-800 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold shrink-0">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'AM'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-cream block truncate">
                {user?.name || 'Alex Morgan'}
              </span>
              <span className="text-[10px] text-muted block truncate">
                {user?.email || 'alex@wellora.health'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-tile text-xs font-medium text-muted hover:text-cream hover:bg-neutral-800/70 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <LogOut size={14} aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
