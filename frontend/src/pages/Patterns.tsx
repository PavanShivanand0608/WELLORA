import {
  Lightbulb,
  Info,
} from 'lucide-react'
import { PageHeader, Card, Badge } from '../components/ui'

export default function Patterns() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hunger Patterns"
        subtitle="Empirical correlation between pre-event nutrition and unplanned meal spikes across weekly tracking cycles."
        badge="Weekly Insights"
      />

      {/* Association Warning Banner */}
      <div className="p-4 bg-sand/40 border border-sand rounded-tile flex items-start gap-3">
        <Info size={18} className="text-ink shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-ink">Empirical Association, Not Direct Causation</p>
          <p className="text-[11px] text-muted mt-0.5">
            The patterns below reflect high-probability statistical associations identified between your regular meal macronutrient density and subsequent unplanned eating cues.
          </p>
        </div>
      </div>

      {/* Identified Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pattern 1 */}
        <Card variant="surface" padding="lg" className="border border-line flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="warning" size="sm">
                High Correlation (84%)
              </Badge>
              <span className="text-xs text-muted font-medium">4x This Week</span>
            </div>
            <h3 className="text-base font-bold text-ink mb-2">Late Afternoon Sweet Cravings</h3>
            <p className="text-xs text-muted leading-relaxed mb-4">
              When lunch contains less than 25g of protein, sweet cravings consistently manifest between 4:00 PM and 5:30 PM.
            </p>
            <div className="p-3 bg-screen rounded-tile border border-line text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">Pre-event Fiber:</span>
                <span className="font-bold text-rose-600">4.2g (Very Low)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Pre-event Protein:</span>
                <span className="font-bold text-amber-600">18g (Low)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line text-[11px] text-accent font-semibold flex items-center gap-1">
            <Lightbulb size={14} />
            <span>Target: Add +15g protein to lunch</span>
          </div>
        </Card>

        {/* Pattern 2 */}
        <Card variant="surface" padding="lg" className="border border-line flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="unplanned" size="sm">
                Moderate Correlation (76%)
              </Badge>
              <span className="text-xs text-muted font-medium">3x This Week</span>
            </div>
            <h3 className="text-base font-bold text-ink mb-2">Post-Workout Caloric Overshoot</h3>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Prolonged fasts after intensive resistance exercise trigger rapid consumption of high-glycemic carbohydrates.
            </p>
            <div className="p-3 bg-screen rounded-tile border border-line text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">Avg Window Delay:</span>
                <span className="font-bold text-ink">2h 15m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Unplanned Surge:</span>
                <span className="font-bold text-accent">+450 kcal</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line text-[11px] text-accent font-semibold flex items-center gap-1">
            <Lightbulb size={14} />
            <span>Target: Whey or greek yogurt within 45m</span>
          </div>
        </Card>

        {/* Pattern 3 */}
        <Card variant="surface" padding="lg" className="border border-line flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="neutral" size="sm">
                Emerging Pattern (62%)
              </Badge>
              <span className="text-xs text-muted font-medium">2x This Week</span>
            </div>
            <h3 className="text-base font-bold text-ink mb-2">Stress-Induced Midnight Grazing</h3>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Dinner delayed past 9:00 PM correlates with mindless snacking during late-night laptop work sessions.
            </p>
            <div className="p-3 bg-screen rounded-tile border border-line text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">Dinner Time:</span>
                <span className="font-bold text-ink">9:15 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Reported Cue:</span>
                <span className="font-bold text-muted">Mindless / Stress</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line text-[11px] text-accent font-semibold flex items-center gap-1">
            <Lightbulb size={14} />
            <span>Target: Shift evening meal 45m earlier</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
