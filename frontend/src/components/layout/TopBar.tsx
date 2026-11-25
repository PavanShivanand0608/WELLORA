import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Bell, Calendar, ChevronDown, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import IconButton from '../ui/IconButton'

const ROUTE_INFO: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Daily Dashboard',
    subtitle: 'Track your daily nutrition summary and active nutrient alerts.',
  },
  '/meals': {
    title: 'Meal Log',
    subtitle: 'View and record regular meal history across the week.',
  },
  '/quick-log': {
    title: 'Quick Log',
    subtitle: 'Rapidly record unplanned snacks and meals with eating cues.',
  },
  '/patterns': {
    title: 'Hunger Patterns',
    subtitle: 'Analyze recurring craving associations against your baseline.',
  },
  '/recommendations': {
    title: 'Smart Recommendations',
    subtitle: 'Interpretable food alternative swaps and rule explanations.',
  },
  '/settings': {
    title: 'Settings & Goals',
    subtitle: 'Configure your personal physical metrics and macro targets.',
  },
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const activeInfo = ROUTE_INFO[location.pathname] || {
    title: 'WELLORA',
    subtitle: 'Personalized Nutrition & Wellness Management',
  }

  // Current formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false)
        setNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AM'

  return (
    <header className="sticky top-0 z-20 h-16 bg-surface/90 backdrop-blur-md border-b border-line px-4 sm:px-6 lg:px-8 flex items-center justify-between select-none">
      {/* Left: Active Route Title & Contextual Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate leading-tight">
            {activeInfo.title}
          </h2>
          <span className="text-[11px] text-muted hidden sm:block truncate">
            {todayFormatted} · Welcome back, {user?.name?.split(' ')[0] || 'Alex'}
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications, and Profile */}
      <div className="flex items-center gap-2.5">
        {/* Calendar Action Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-tile bg-screen border border-line text-xs font-medium text-ink">
          <Calendar size={14} className="text-muted" aria-hidden="true" />
          <span>{todayFormatted}</span>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <IconButton
            icon={Bell}
            aria-label="View notifications and nutrient alerts"
            variant="surface"
            size="sm"
            onClick={() => setNotificationOpen(!notificationOpen)}
          />
          {/* Active Alert Dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent ring-2 ring-surface"
            aria-hidden="true"
          />

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-card bg-surface border border-line shadow-soft p-4 text-ink z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">
                  Nutrient Alerts
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-soft text-ink font-semibold">
                  1 Active
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-tile bg-screen border border-line text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-ink">Low Protein Window</span>
                    <span className="text-[10px] text-accent font-semibold">High Priority</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Rolling 5-day protein is 28% below baseline before afternoon unplanned meals.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-expanded={profileDropdownOpen}
            aria-label="User profile and account menu"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full border border-line hover:border-neutral-300 bg-surface transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-ink text-xs font-black shadow-xs">
              {userInitials}
            </div>
            <span className="text-xs font-bold text-ink hidden md:inline-block max-w-[100px] truncate">
              {user?.name || 'Alex Morgan'}
            </span>
            <ChevronDown
              size={14}
              className={`text-muted transition-transform duration-200 ${
                profileDropdownOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-card bg-surface border border-line shadow-soft p-2 text-ink z-50">
              {/* User Identity Header */}
              <div className="px-3 py-2.5 border-b border-line mb-1">
                <p className="text-xs font-bold text-ink truncate">{user?.name || 'Alex Morgan'}</p>
                <p className="text-[11px] text-muted truncate">{user?.email || 'alex@wellora.health'}</p>
              </div>

              {/* Menu Items */}
              <div className="space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-tile text-xs text-ink hover:bg-screen transition-colors font-medium"
                >
                  <Settings size={14} className="text-muted" aria-hidden="true" />
                  <span>Account & Goals</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-tile text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left cursor-pointer"
                >
                  <LogOut size={14} aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
