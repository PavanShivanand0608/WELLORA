import { useState } from 'react'
import {
  Plus,
  Clock,
  Filter,
  Calendar as CalendarIcon,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie,
} from 'lucide-react'
import { PageHeader, Card, Button, Badge, Chip } from '../components/ui'

export default function MealLog() {
  const [selectedFilter, setSelectedFilter] = useState('All')

  const filterChips = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Unplanned']

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meal Log"
        subtitle="Log and track your regular and unplanned daily meals, macronutrient profiles, and meal times."
        badge="4 Logged Today"
        action={
          <Button
            variant="dark"
            size="md"
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            Log Regular Meal
          </Button>
        }
      />

      {/* Date & Filter Navigation Bar */}
      <Card variant="surface" padding="md" className="border border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-cream px-3 py-1.5 rounded-tile text-sm font-semibold text-ink border border-line">
              <CalendarIcon size={16} className="text-muted" />
              <span>Today, November 25</span>
            </div>
            <span className="text-xs text-muted font-medium">Daily Target: 2,200 kcal</span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={15} className="text-muted shrink-0 mr-1 hidden sm:block" />
            {filterChips.map((chip) => (
              <Chip
                key={chip}
                selected={selectedFilter === chip}
                onClick={() => setSelectedFilter(chip)}
              >
                {chip}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      {/* Meals List */}
      <div className="space-y-4">
        {/* Breakfast */}
        <Card variant="surface" padding="lg" className="border border-line">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-tile bg-cream flex items-center justify-center text-ink shrink-0">
                <Coffee size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ink">Breakfast</h3>
                  <Badge variant="regular" size="sm">
                    Regular
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> 8:30 AM
                  </span>
                  <span>•</span>
                  <span>Home Prepared</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-ink">420 kcal</span>
              <span className="text-xs text-muted block">19% of daily goal</span>
            </div>
          </div>

          <div className="bg-screen p-3 rounded-tile border border-line flex items-center justify-between text-xs">
            <span className="font-medium text-ink">
              Steel-Cut Oats with Blueberries, Chia Seeds & Almond Milk
            </span>
            <div className="flex items-center gap-3 text-muted shrink-0 font-medium">
              <span>P: 14g</span>
              <span>C: 68g</span>
              <span>F: 9g</span>
              <span className="text-emerald-600 font-bold">Fiber: 11g</span>
            </div>
          </div>
        </Card>

        {/* Lunch */}
        <Card variant="surface" padding="lg" className="border border-line">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-tile bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <UtensilsCrossed size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ink">Lunch</h3>
                  <Badge variant="unplanned" size="sm">
                    Regular
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> 1:15 PM
                  </span>
                  <span>•</span>
                  <span>Meal Prep</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-ink">620 kcal</span>
              <span className="text-xs text-muted block">28% of daily goal</span>
            </div>
          </div>

          <div className="bg-screen p-3 rounded-tile border border-line flex items-center justify-between text-xs">
            <span className="font-medium text-ink">
              Citrus Quinoa Power Bowl with Grilled Chicken Breast & Tahini
            </span>
            <div className="flex items-center gap-3 text-muted shrink-0 font-medium">
              <span>P: 44g</span>
              <span>C: 58g</span>
              <span>F: 18g</span>
              <span className="text-emerald-600 font-bold">Fiber: 8g</span>
            </div>
          </div>
        </Card>

        {/* Afternoon Snack */}
        <Card variant="surface" padding="lg" className="border border-line">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-tile bg-sand flex items-center justify-center text-ink shrink-0">
                <Cookie size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ink">Afternoon Snack</h3>
                  <Badge variant="warning" size="sm">
                    Unplanned
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> 4:45 PM
                  </span>
                  <span>•</span>
                  <span>Eating Cue: Craving / Energy Drop</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-ink">280 kcal</span>
              <span className="text-xs text-muted block">13% of daily goal</span>
            </div>
          </div>

          <div className="bg-screen p-3 rounded-tile border border-line flex items-center justify-between text-xs">
            <span className="font-medium text-ink">Greek Yogurt with Honey & Crushed Walnuts</span>
            <div className="flex items-center gap-3 text-muted shrink-0 font-medium">
              <span>P: 22g</span>
              <span>C: 14g</span>
              <span>F: 12g</span>
              <span className="text-emerald-600 font-bold">Fiber: 2g</span>
            </div>
          </div>
        </Card>

        {/* Dinner */}
        <Card variant="surface" padding="lg" className="border border-line">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-tile bg-neutral-900 text-cream flex items-center justify-center shrink-0">
                <Moon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ink">Dinner</h3>
                  <Badge variant="neutral" size="sm">
                    Planned
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> 7:45 PM
                  </span>
                  <span>•</span>
                  <span>Evening Nourishment</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-ink">520 kcal</span>
              <span className="text-xs text-muted block">24% of daily goal</span>
            </div>
          </div>

          <div className="bg-screen p-3 rounded-tile border border-line flex items-center justify-between text-xs">
            <span className="font-medium text-ink">
              Pan-Seared Salmon Fillet with Steamed Asparagus & Roasted Sweet Potato
            </span>
            <div className="flex items-center gap-3 text-muted shrink-0 font-medium">
              <span>P: 38g</span>
              <span>C: 32g</span>
              <span>F: 22g</span>
              <span className="text-emerald-600 font-bold">Fiber: 6g</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
