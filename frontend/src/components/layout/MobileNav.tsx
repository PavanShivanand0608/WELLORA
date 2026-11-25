import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Zap,
  LineChart,
  Sparkles,
  Settings,
} from 'lucide-react'

const MOBILE_NAV_ITEMS = [
  {
    name: 'Home',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Meals',
    path: '/meals',
    icon: UtensilsCrossed,
  },
  {
    name: 'Quick Log',
    path: '/quick-log',
    icon: Zap,
    isSpecial: true,
  },
  {
    name: 'Patterns',
    path: '/patterns',
    icon: LineChart,
  },
  {
    name: 'Recs',
    path: '/recommendations',
    icon: Sparkles,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]

export default function MobileNav() {
  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-3 inset-x-3 z-40 lg:hidden max-w-md mx-auto select-none"
    >
      <div className="bg-panel/95 backdrop-blur-xl border border-neutral-700/80 rounded-[22px] shadow-[0_12px_36px_rgba(0,0,0,0.6)] px-2 py-2 flex items-center justify-between">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center transition-all duration-150 w-11 h-11 rounded-tile focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'bg-accent text-ink font-bold shadow-sm'
                    : item.isSpecial
                      ? 'bg-neutral-800 text-accent hover:bg-neutral-700'
                      : 'text-muted hover:text-cream'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={item.isSpecial ? 20 : 17}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden="true"
                  />
                  <span className="text-[9px] font-semibold tracking-tight mt-0.5 leading-none">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
