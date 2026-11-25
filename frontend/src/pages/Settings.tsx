import { useNavigate } from 'react-router-dom'
import {
  User,
  Target,
  LogOut,
  ShieldCheck,
  Scale,
  Ruler,
} from 'lucide-react'
import { PageHeader, Card, Button } from '../components/ui'
import { useAuth } from '../lib/auth'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Profile"
        subtitle="Manage your personal physical parameters, daily macronutrient targets, and account security."
        badge="Profile Active"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal & Physical Parameters */}
        <Card variant="surface" padding="lg" className="lg:col-span-2 border border-line space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User size={18} className="text-accent" />
              <h2 className="text-base font-bold text-ink">Personal Profile</h2>
            </div>
            <p className="text-xs text-muted">
              Used to calculate basal metabolic rate and personalized nutrient targets
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-screen rounded-tile border border-line">
              <span className="text-xs text-muted block mb-0.5">Full Name</span>
              <span className="text-sm font-bold text-ink">{user?.name || 'Alex Morgan'}</span>
            </div>

            <div className="p-3 bg-screen rounded-tile border border-line">
              <span className="text-xs text-muted block mb-0.5">Email Address</span>
              <span className="text-sm font-bold text-ink">
                {user?.email || 'alex@wellora.health'}
              </span>
            </div>

            <div className="p-3 bg-screen rounded-tile border border-line flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block mb-0.5">Current Weight</span>
                <span className="text-sm font-bold text-ink">72.5 kg</span>
              </div>
              <Scale size={18} className="text-muted" />
            </div>

            <div className="p-3 bg-screen rounded-tile border border-line flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block mb-0.5">Height</span>
                <span className="text-sm font-bold text-ink">178 cm</span>
              </div>
              <Ruler size={18} className="text-muted" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target size={18} className="text-accent" />
              <h2 className="text-base font-bold text-ink">Daily Nutrition Targets</h2>
            </div>
            <p className="text-xs text-muted mb-4">
              Preset based on moderate activity level and lean body mass retention
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-cream/70 rounded-tile border border-line">
                <span className="text-[11px] text-muted block">Daily Energy</span>
                <span className="text-base font-black text-ink">2,200 kcal</span>
              </div>
              <div className="p-3 bg-cream/70 rounded-tile border border-line">
                <span className="text-[11px] text-muted block">Protein</span>
                <span className="text-base font-black text-ink">140g (25%)</span>
              </div>
              <div className="p-3 bg-cream/70 rounded-tile border border-line">
                <span className="text-[11px] text-muted block">Net Carbs</span>
                <span className="text-base font-black text-ink">220g (40%)</span>
              </div>
              <div className="p-3 bg-cream/70 rounded-tile border border-line">
                <span className="text-[11px] text-muted block">Healthy Fats</span>
                <span className="text-base font-black text-ink">65g (35%)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Management & Sign Out */}
        <Card variant="surface" padding="lg" className="border border-line flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent" />
              <h2 className="text-base font-bold text-ink">Session & Security</h2>
            </div>

            <div className="p-3 bg-screen rounded-tile border border-line text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted">Auth Status:</span>
                <span className="font-bold text-emerald-700">Authenticated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Storage:</span>
                <span className="font-bold text-ink">SessionStorage Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Data Engine:</span>
                <span className="font-bold text-ink">WELLORA Client v1</span>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Signing out will clear your active local session token. You will be redirected back to the landing page.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-line">
            <Button
              variant="dark"
              size="md"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Sign Out of WELLORA
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
