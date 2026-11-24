import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { IconButton } from '../ui'

export interface TopbarProps {
  mobileNavOpen: boolean
  onMenuClick: () => void
}

export function Topbar({ mobileNavOpen, onMenuClick }: TopbarProps) {
  const { settings } = useSettings()
  const { user } = useAuth()
  const displayName = settings.profile.fullName || user?.fullName || 'WELLORA member'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-screen/95 px-4 backdrop-blur sm:h-20 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          aria-label={mobileNavOpen ? 'Navigation is open' : 'Open navigation'}
          aria-controls="mobile-sidebar"
          aria-expanded={mobileNavOpen}
          buttonSize="md"
          className="md:hidden"
          icon={Menu}
          onClick={onMenuClick}
          type="button"
          variant="light"
        />
        <div className="min-w-0">
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-muted sm:block">
            WELLORA member space
          </p>
          <p className="truncate text-sm font-semibold text-ink sm:mt-1">
            A thoughtful view of today
          </p>
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="relative inline-flex">
          <IconButton
            aria-label="Notifications"
            buttonSize="md"
            icon={Bell}
            type="button"
            variant="light"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-2 size-2 rounded-full border-2 border-screen bg-accent"
          />
        </span>

        <div
          className="flex items-center gap-2.5 border-l border-line pl-3 sm:gap-3 sm:pl-4"
          aria-label={`Signed in as ${displayName}`}
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-sand text-xs font-semibold text-ink sm:size-10"
          >
            {initials}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-36 truncate text-sm font-semibold text-ink">
              {displayName}
            </span>
            <span className="mt-0.5 block max-w-36 truncate text-xs text-muted">{settings.profile.email || user?.email || ''}</span>
          </span>
        </div>
      </div>
    </header>
  )
}

export default Topbar
