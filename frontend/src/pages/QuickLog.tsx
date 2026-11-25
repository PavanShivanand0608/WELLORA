import { useState } from 'react'
import {
  Zap,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react'
import { PageHeader, Card, Button, Chip, Input } from '../components/ui'

export default function QuickLog() {
  const [selectedCue, setSelectedCue] = useState<string>('Craving')
  const [selectedContext, setSelectedContext] = useState<string>('Work stress')
  const [foodQuery, setFoodQuery] = useState('')
  const [logged, setLogged] = useState(false)

  const cues = [
    {
      id: 'Hungry',
      title: 'Physiological Hunger',
      desc: 'Physical stomach emptiness, energy decline, >4h since last meal',
    },
    {
      id: 'Craving',
      title: 'Craving / Appetite',
      desc: 'Desire for a specific taste, mouthfeel, sweet or salty stimulus',
    },
    {
      id: 'Overate',
      title: 'Overate / Portions',
      desc: 'Exceeded planned meal quantity due to high food palatability',
    },
    {
      id: 'Just because',
      title: 'Just Because / Habit',
      desc: 'Social setting, mindless snacking, boredom, or routine cue',
    },
  ]

  const contexts = [
    'Work stress',
    'Late night',
    'Social gathering',
    'Boredom',
    'Post-workout',
    'Celebration',
  ]

  const handleQuickSubmit = () => {
    setLogged(true)
    setTimeout(() => {
      setLogged(false)
      setFoodQuery('')
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quick Log"
        subtitle="Rapidly log unplanned meals, snacks, and appetite spikes with contextual eating cues and immediate metabolic feedback."
        badge="Unplanned Entry"
      />

      {logged && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-tile flex items-center gap-3 text-emerald-900 transition-all">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">Unplanned meal logged successfully!</p>
            <p className="text-xs text-emerald-700">
              Correlated with your rolling 5-day baseline. View patterns in the Hunger Patterns tab.
            </p>
          </div>
        </div>
      )}

      {/* Step 1: Select Eating Cue */}
      <Card variant="surface" padding="lg" className="border border-line">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h2 className="text-base font-bold text-ink">What prompted this eating event?</h2>
        </div>
        <p className="text-xs text-muted mb-4 ml-8">
          Identifying your psychological or physiological trigger is key to understanding patterns.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cues.map((cue) => {
            const isSelected = selectedCue === cue.id
            return (
              <button
                key={cue.id}
                type="button"
                onClick={() => setSelectedCue(cue.id)}
                className={`text-left p-4 rounded-tile border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-accent-soft/40 shadow-xs ring-2 ring-accent/30'
                    : 'border-line bg-screen hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-sm font-bold ${
                      isSelected ? 'text-accent' : 'text-ink'
                    }`}
                  >
                    {cue.id}
                  </span>
                  {isSelected && <Zap size={14} className="text-accent" />}
                </div>
                <p className="text-xs font-semibold text-ink/90 mb-1">{cue.title}</p>
                <p className="text-[11px] text-muted leading-tight">{cue.desc}</p>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Step 2: What was consumed & Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="surface" padding="lg" className="lg:col-span-2 border border-line space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h2 className="text-base font-bold text-ink">Food or Snack Consumed</h2>
          </div>

          <div className="space-y-3">
            <Input
              label="Search Food or Enter Custom Item"
              placeholder="e.g. Dark Chocolate Almonds, Croissant, Potato Chips..."
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
            />

            <div>
              <span className="text-xs font-semibold text-ink block mb-2">
                Context / Environmental Trigger
              </span>
              <div className="flex flex-wrap gap-2">
                {contexts.map((ctx) => (
                  <Chip
                    key={ctx}
                    selected={selectedContext === ctx}
                    onClick={() => setSelectedContext(ctx)}
                  >
                    {ctx}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="dark"
                size="md"
                onClick={handleQuickSubmit}
                disabled={!foodQuery.trim() || logged}
                className="w-full flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                Save Quick Log Entry
              </Button>
            </div>
          </div>
        </Card>

        {/* Instant Telemetry Panel */}
        <Card variant="surface" padding="lg" className="border border-line flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-accent" />
              <h3 className="text-sm font-bold text-ink">Intelligent Cue Feedback</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-4">
              When cravings occur between 4 PM and 6 PM with a {selectedCue} cue, WELLORA compares your prior 5-day baseline protein and fiber intake.
            </p>
            <div className="p-3 bg-cream/70 rounded-tile border border-line space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted">
                <span>Selected Cue:</span>
                <span className="font-bold text-ink">{selectedCue}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Context:</span>
                <span className="font-bold text-ink">{selectedContext}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Logging Mode:</span>
                <span className="font-bold text-emerald-700">Immediate Non-Judgmental</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line text-[11px] text-muted flex items-center gap-1.5">
            <HeartHandshake size={14} className="text-muted shrink-0" />
            <span>Encouraging consistency over strict perfection.</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
