import { useNavigate } from 'react-router-dom'
import {
  Flame,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Salad,
  Coffee,
  Sparkles,
} from 'lucide-react'
import { PageHeader, Card, Button, Badge } from '../components/ui'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of daily nutrition, rolling 5-day nutrient averages, and active wellness alerts."
        badge="Active Day"
        action={
          <Button
            variant="accent"
            size="md"
            onClick={() => navigate('/quick-log')}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            Quick Log Meal
          </Button>
        }
      />

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <Card variant="surface" padding="md" className="relative overflow-hidden border border-line">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Energy Intake
            </span>
            <div className="w-8 h-8 rounded-tile bg-accent-soft text-accent flex items-center justify-center">
              <Flame size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-black text-ink">1,840</span>
            <span className="text-xs text-muted font-medium">/ 2,200 kcal</span>
          </div>
          <div className="w-full bg-sand rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-accent h-2 rounded-full" style={{ width: '83%' }} />
          </div>
          <span className="text-[11px] text-muted flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold">360 kcal</span> remaining today
          </span>
        </Card>

        {/* Protein Card */}
        <Card variant="surface" padding="md" className="relative overflow-hidden border border-line">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Protein
            </span>
            <div className="w-8 h-8 rounded-tile bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-black text-ink">112g</span>
            <span className="text-xs text-muted font-medium">/ 140g target</span>
          </div>
          <div className="w-full bg-sand rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '80%' }} />
          </div>
          <span className="text-[11px] text-muted font-medium">80% of daily optimal target</span>
        </Card>

        {/* Carbs Card */}
        <Card variant="surface" padding="md" className="relative overflow-hidden border border-line">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Net Carbs
            </span>
            <div className="w-8 h-8 rounded-tile bg-blue-50 text-blue-600 flex items-center justify-center">
              <Salad size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-black text-ink">168g</span>
            <span className="text-xs text-muted font-medium">/ 220g target</span>
          </div>
          <div className="w-full bg-sand rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }} />
          </div>
          <span className="text-[11px] text-muted font-medium">76% consumed — stable glucose</span>
        </Card>

        {/* Healthy Fats Card */}
        <Card variant="surface" padding="md" className="relative overflow-hidden border border-line">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Healthy Fats
            </span>
            <div className="w-8 h-8 rounded-tile bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-black text-ink">52g</span>
            <span className="text-xs text-muted font-medium">/ 65g target</span>
          </div>
          <div className="w-full bg-sand rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '80%' }} />
          </div>
          <span className="text-[11px] text-muted font-medium">High mono-unsaturated ratio</span>
        </Card>
      </div>

      {/* Middle Telemetry Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rolling 5-day Nutrient Average */}
        <Card variant="surface" padding="lg" className="lg:col-span-2 border border-line">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-ink">Rolling 5-Day Nutrient Baseline</h2>
              <p className="text-xs text-muted">
                Weighted moving averages compared to your metabolic blueprint
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              5-Day Window
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-cream/50 p-3 rounded-tile border border-line/60">
              <span className="text-[11px] text-muted block mb-0.5">5-Day Calories</span>
              <span className="text-lg font-black text-ink">2,040 kcal</span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                Within ±5% target
              </span>
            </div>
            <div className="bg-cream/50 p-3 rounded-tile border border-line/60">
              <span className="text-[11px] text-muted block mb-0.5">Avg Protein</span>
              <span className="text-lg font-black text-ink">134g</span>
              <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                -6g below optimal
              </span>
            </div>
            <div className="bg-cream/50 p-3 rounded-tile border border-line/60">
              <span className="text-[11px] text-muted block mb-0.5">Dietary Fiber</span>
              <span className="text-lg font-black text-ink">21g</span>
              <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                Low (Target 30g)
              </span>
            </div>
          </div>

          <div className="p-4 bg-screen rounded-tile border border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Macro Adherence Score: 88 / 100</p>
                <p className="text-xs text-muted">
                  Consistency is high this week. Recommended adjustment: add soluble fiber to lunch.
                </p>
              </div>
            </div>
            <Button
              variant="sand"
              size="sm"
              onClick={() => navigate('/patterns')}
              className="text-xs shrink-0"
            >
              View Patterns
            </Button>
          </div>
        </Card>

        {/* Active Alerts Panel */}
        <Card variant="surface" padding="lg" className="border border-line flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Active Alerts</h2>
              <Badge variant="warning" size="sm">
                2 Noticed
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-tile flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-950">Low Fiber Detected</p>
                  <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                    Your 5-day fiber average is 21g against 30g target. This correlates with 4 PM cravings.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-tile flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-950">Hydration On Track</p>
                  <p className="text-[11px] text-blue-800 leading-snug mt-0.5">
                    2.4L recorded today. Satiety retention is within the upper quartile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line">
            <Button
              variant="light"
              size="sm"
              onClick={() => navigate('/recommendations')}
              className="w-full text-xs"
            >
              Explore Recommendations →
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Meal Logs Preview */}
      <Card variant="surface" padding="lg" className="border border-line">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Today's Meal Log</h2>
            <p className="text-xs text-muted">Chronological nutrition intake entries for today</p>
          </div>
          <Button
            variant="sand"
            size="sm"
            onClick={() => navigate('/meals')}
            className="text-xs"
          >
            Full Meal History
          </Button>
        </div>

        <div className="divide-y divide-line">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-tile bg-cream flex items-center justify-center text-ink">
                <Coffee size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Steel-Cut Oats with Berries & Chia</p>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> 8:30 AM
                  </span>
                  <span>•</span>
                  <span>Regular Breakfast</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-ink block">420 kcal</span>
              <span className="text-[11px] text-muted">14g P • 68g C • 9g F</span>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-tile bg-accent-soft text-accent flex items-center justify-center">
                <Salad size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink">Citrus Quinoa Bowl & Grilled Chicken</p>
                  <Badge variant="unplanned" size="sm">
                    High Protein
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> 1:15 PM
                  </span>
                  <span>•</span>
                  <span>Regular Lunch</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-ink block">620 kcal</span>
              <span className="text-[11px] text-muted">44g P • 58g C • 18g F</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
