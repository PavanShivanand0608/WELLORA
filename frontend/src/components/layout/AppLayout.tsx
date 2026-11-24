import { Suspense, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MealDataProvider } from '../../context/MealDataContext'
import { SettingsProvider } from '../../context/SettingsContext'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!mobileNavOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileNavOpen])

  function closeMobileNav() {
    setMobileNavOpen(false)
  }

  return (
    <div className="min-h-screen bg-screen">
      <Sidebar mode="desktop" />

      <div className="min-h-screen min-w-0 md:pl-20 lg:pl-64">
        <SettingsProvider>
          <Topbar
            mobileNavOpen={mobileNavOpen}
            onMenuClick={() => setMobileNavOpen(true)}
          />
          <MealDataProvider>
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              <Suspense fallback={<main role="status" aria-live="polite" className="grid min-h-[50vh] place-items-center rounded-card bg-surface px-6 text-sm font-medium text-muted shadow-soft">Loading this WELLORA view…</main>}>
                <Outlet />
              </Suspense>
            </div>
          </MealDataProvider>
        </SettingsProvider>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 z-0 cursor-default bg-panel/60"
            onClick={closeMobileNav}
            type="button"
          />
          <Sidebar
            mode="drawer"
            onClose={closeMobileNav}
            onNavigate={closeMobileNav}
          />
        </div>
      ) : null}
    </div>
  )
}

export default AppLayout
