import {
  ArrowRight,
} from 'lucide-react'
import { PageHeader, Card, Button, Badge } from '../components/ui'

export default function Recommendations() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Recommendations"
        subtitle="Rule-based, interpretable nutritional guidance and high-nutrient food alternative swaps based on your metabolic data."
        badge="Rule Engine v1.0"
      />

      {/* Explanatory Rule Engine Cards */}
      <div className="space-y-4">
        {/* Recommendation 1 */}
        <Card variant="surface" padding="lg" className="border border-line">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="warning" size="sm">
                  Priority High
                </Badge>
                <span className="text-xs text-muted font-medium">Satiety Optimization Rule</span>
              </div>
              <h3 className="text-lg font-bold text-ink">
                Increase Mid-Day Soluble Fiber to Diminish 4 PM Appetite Spike
              </h3>
            </div>
            <span className="text-xs text-muted bg-cream px-3 py-1.5 rounded-tile border border-line shrink-0">
              Confidence Score: 94%
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed mb-4">
            <strong className="text-ink">Underlying Rationale:</strong> Your 5-day rolling fiber average is 21g vs 30g target. On days where lunch fiber exceeds 10g, late-afternoon craving incidents decrease by 68%.
          </p>

          {/* Food Alternative Swap Tile */}
          <div className="p-4 bg-screen rounded-tile border border-line flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 rounded-tile bg-rose-50 text-rose-700 text-xs font-bold shrink-0">
                Current Pick
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Refined White Bread Toast</p>
                <p className="text-[11px] text-muted">140 kcal • 1g Fiber • High Glycemic</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <ArrowRight size={16} />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 rounded-tile bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
                Recommended Swap
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Quinoa & Roasted Chickpeas</p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  180 kcal • +7g Fiber • +6g Protein
                </p>
              </div>
            </div>

            <Button variant="sand" size="sm" className="text-xs shrink-0 w-full sm:w-auto">
              Apply Swap
            </Button>
          </div>
        </Card>

        {/* Recommendation 2 */}
        <Card variant="surface" padding="lg" className="border border-line">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="neutral" size="sm">
                  Priority Moderate
                </Badge>
                <span className="text-xs text-muted font-medium">Metabolic Recovery Rule</span>
              </div>
              <h3 className="text-lg font-bold text-ink">
                Front-Load Protein at Breakfast to Sustain Baseline Thermogenesis
              </h3>
            </div>
            <span className="text-xs text-muted bg-cream px-3 py-1.5 rounded-tile border border-line shrink-0">
              Confidence Score: 87%
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed mb-4">
            <strong className="text-ink">Underlying Rationale:</strong> Breakfasts with ≥30g protein yield superior glycemic stability and lower ghrelin secretion across the subsequent 6 hours.
          </p>

          {/* Food Alternative Swap Tile */}
          <div className="p-4 bg-screen rounded-tile border border-line flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 rounded-tile bg-rose-50 text-rose-700 text-xs font-bold shrink-0">
                Current Pick
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Regular Granola Bar</p>
                <p className="text-[11px] text-muted">210 kcal • 3g Protein • 22g Sugar</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <ArrowRight size={16} />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 rounded-tile bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
                Recommended Swap
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Greek Yogurt & Hemp Seeds</p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  220 kcal • +21g Protein • 0g Added Sugar
                </p>
              </div>
            </div>

            <Button variant="sand" size="sm" className="text-xs shrink-0 w-full sm:w-auto">
              Apply Swap
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
