import { useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Droplets,
  Flame,
  Sprout,
  TrendingUp,
  Utensils,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FoodArt } from '../components/FoodArt'
import { Badge, Button, Card } from '../components/ui'
import { useSettings } from '../context/SettingsContext'
import { formatDateKey, getDateKeyInTimezone, getTimeKeyInTimezone, shiftDateKey } from '../lib/date'
import { useDashboardAnalytics, useNutritionTrends } from '../hooks/useAnalytics'
import type { MealEntry } from '../types/meal'

interface ProgressBarProps {
  label: string
  value: number | null
  max?: number
  fillClass?: string
}

function ProgressBar({ label, value, max, fillClass = 'bg-accent' }: ProgressBarProps) {
  const progress = value !== null && max !== undefined && max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div
      {...(max !== undefined && max > 0 ? {
        role: 'progressbar',
        'aria-label': label,
        'aria-valuemin': 0,
        'aria-valuemax': max,
        'aria-valuenow': value === null ? 0 : Math.min(value, max),
        'aria-valuetext': value === null ? 'No nutrition values recorded' : `${value} of ${max}`,
      } : { 'aria-hidden': true })}
      className="h-2.5 overflow-hidden rounded-full bg-line"
    >
      <div
        className={`h-full rounded-full ${fillClass}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

interface MacroCardProps {
  label: string
  value: number | null
  goal?: number
  icon: LucideIcon
  fillClass: string
  iconClass: string
}

function MacroCard({
  fillClass,
  goal,
  icon: Icon,
  iconClass,
  label,
  value,
}: MacroCardProps) {
  const percentage = value === null || goal === undefined ? null : Math.min(Math.round((value / goal) * 100), 100)

  return (
    <Card className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-tile ${iconClass}`}>
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <h3 className="truncate text-sm font-semibold text-ink">{label}</h3>
        </div>
        <span className="text-xs font-semibold text-muted">{percentage === null ? '—' : `${percentage}%`}</span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight text-ink">
        {value === null ? '—' : value}
        <span className="ml-1 text-sm font-medium text-muted">g</span>
      </p>
      <p className="mt-1 text-xs text-muted">{goal === undefined ? 'No configured goal preference' : value === null ? `of your ${goal} g preference` : `of your ${goal} g preference`}</p>
      <div className="mt-4">
        <ProgressBar label={`${label} toward your configured preference`} value={value} max={goal} fillClass={fillClass} />
      </div>
    </Card>
  )
}

function formatMealTime(loggedAt: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(loggedAt))
}

function MealSummaryRow({ meal }: { meal: MealEntry }) {
  const mealLabel = meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()
  const isUnplanned = meal.logType === 'UNPLANNED'

  return (
    <article className="flex min-w-0 items-center gap-3 rounded-tile border border-line bg-screen p-3 sm:gap-4 sm:p-4">
      <div className="grid size-14 shrink-0 place-items-center rounded-tile bg-cream p-1.5 sm:size-16">
        <FoodArt variant={meal.foodArt} className="size-full" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            {mealLabel}
          </span>
          <Badge variant={isUnplanned ? 'unplanned' : 'regular'}>
            {isUnplanned ? 'Unplanned' : 'Regular'}
          </Badge>
        </div>
        <h3 className="mt-1 truncate text-sm font-semibold text-ink">
          {meal.foodName}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <Clock3 aria-hidden="true" className="size-3.5" />
          {formatMealTime(meal.loggedAt)}
          {meal.eatingCueDetail || meal.eatingCue ? (
            <span>· {(meal.eatingCueDetail ?? meal.eatingCue)?.toLowerCase().replaceAll('_', ' ')}</span>
          ) : null}
        </p>
      </div>
      <p className="shrink-0 text-right">
        <span className="block text-sm font-semibold tabular-nums text-ink">
          {meal.calories?.toLocaleString() ?? '—'}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
          kcal
        </span>
      </p>
    </article>
  )
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function Dashboard() {
  const navigate = useNavigate()
  const { settings, isLoading: settingsLoading } = useSettings()
  const timezone = settings.applicationPreferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const [mountedAt] = useState(() => new Date())
  const [selectedDateOverride, setSelectedDateOverride] = useState<string | null>(null)
  const selectedDate = selectedDateOverride ?? getDateKeyInTimezone(mountedAt, timezone)
  const dashboardQuery = useDashboardAnalytics(selectedDate, timezone, !settingsLoading)
  const trendsQuery = useNutritionTrends({ startDate: shiftDateKey(selectedDate, -6), endDate: selectedDate, timezone }, !settingsLoading)
  const todayMeals = dashboardQuery.data?.meals ?? []
  const totals = dashboardQuery.data?.summary
  const goals = totals?.goals ?? {}
  const consumed = totals?.calories.total ?? null
  const goal = goals.calories
  const remaining = totals?.remaining.calories ?? null
  const trendData = (trendsQuery.data?.days ?? []).map((day) => ({
    ...day,
    label: formatDateKey(day.date, { month: 'short', day: 'numeric' }, timezone),
  }))
  const observations = [
    {
      title: 'Meals recorded today',
      description: totals?.mealCount ? `${totals.mealCount} ${totals.mealCount === 1 ? 'meal is' : 'meals are'} in today’s log, including ${totals.unplannedMealCount} marked unplanned.` : 'No meals have been added to today’s log yet.',
    },
    {
      title: 'Nutrition details',
      description: totals?.calories.total === null || !totals ? 'Calories are not available for the meals recorded today. Add nutrition details to see a total.' : `${totals.calories.recordedCount} recorded calorie value${totals.calories.recordedCount === 1 ? '' : 's'} contribute to today’s total.`,
    },
  ]
  const today = formatDateKey(selectedDate, undefined, timezone)
  const greeting = greetingForHour(Number(getTimeKeyInTimezone(mountedAt, timezone).slice(0, 2)))

  return (
    <main className="min-w-0 space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {today}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">
            {greeting}, {settings.profile.fullName}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            A steady pace is enough. Today is about finding a rhythm that feels right for you.
          </p>
        </div>
        <label className="flex min-h-11 self-start items-center gap-2 rounded-tile border border-line bg-surface px-3 text-xs font-medium text-muted focus-within:ring-2 focus-within:ring-accent sm:self-auto">
          <span className="whitespace-nowrap">View day</span>
          <input aria-label="Dashboard date" type="date" value={selectedDate} onChange={(event) => setSelectedDateOverride(event.target.value)} className="min-w-0 bg-transparent text-ink outline-none" />
        </label>
      </section>

      {dashboardQuery.error || trendsQuery.error ? <p role="alert" className="rounded-tile border border-accent bg-accent-soft/70 p-4 text-sm text-ink">{dashboardQuery.error instanceof Error ? dashboardQuery.error.message : trendsQuery.error instanceof Error ? trendsQuery.error.message : 'Your analytics could not be loaded.'}</p> : null}

      <section aria-labelledby="daily-summary-title">
        <Card className="overflow-hidden">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-ink">
                  <Flame aria-hidden="true" className="size-4" />
                </span>
                <h2 id="daily-summary-title">Daily nutrition summary</h2>
              </div>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-5xl font-semibold tracking-[-0.055em] text-ink sm:text-6xl">
                  {consumed === null ? '—' : consumed.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-muted">kcal consumed</p>
              </div>
              <p className="mt-2 text-sm text-muted">
                {goal === undefined ? 'No calorie goal preference is configured.' : `of ${goal.toLocaleString()} kcal configured goal preference`}
              </p>
            </div>

            <div className="rounded-tile bg-screen p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Remaining to your configured goal
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {remaining === null ? '—' : remaining.toLocaleString()}
                    <span className="ml-1.5 text-sm font-medium text-muted">kcal</span>
                  </p>
                </div>
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-ink">
                    {consumed === null || goal === undefined ? '—' : `${Math.round((consumed / goal) * 100)}%`}
                </span>
              </div>
              <div className="mt-5">
                <ProgressBar
                  label="Calories consumed toward your configured goal preference"
                  value={consumed}
                  max={goal}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Goal preferences are user configured, not medical prescriptions. Values reflect nutrition recorded in your saved meals.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section aria-label="Macronutrient summary against your configured goal preferences" className="grid gap-4 md:grid-cols-3">
        <MacroCard
          fillClass="bg-accent"
          goal={goals.proteinG}
          icon={Sprout}
          iconClass="bg-accent-soft text-ink"
          label="Protein"
          value={totals?.proteinG.total ?? null}
        />
        <MacroCard
          fillClass="bg-backdrop"
          goal={goals.carbsG}
          icon={Wheat}
          iconClass="bg-cream text-panel"
          label="Carbohydrates"
          value={totals?.carbsG.total ?? null}
        />
        <MacroCard
          fillClass="bg-panel"
          goal={goals.fatG}
          icon={Droplets}
          iconClass="bg-sand text-ink"
          label="Fat"
          value={totals?.fatG.total ?? null}
        />
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-12">
        <Card className="min-w-0 xl:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp aria-hidden="true" className="size-4 text-panel" />
                <h2 className="text-base font-semibold text-ink">Daily nutrition trend</h2>
              </div>
              <p className="mt-1 text-xs text-muted">Recorded daily nutrition for the selected day and six days before it</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-accent" /> Calories
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-px w-4 border-t border-dashed border-muted" /> Goal
              </span>
            </div>
          </div>
          <div
            role="img"
            aria-label="Area chart of recorded daily calories for the selected day and six days before it"
            className="mt-5 h-[230px] min-w-0 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 6, right: 8, bottom: 0, left: -18 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-line)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
                  tickMargin={10}
                />
                <YAxis
                  domain={[0, 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-muted)', fontSize: 10 }}
                  tickFormatter={(value: number) => `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-line)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-soft)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                  }}
                />
                {goal !== undefined ? <ReferenceLine y={goal} stroke="var(--color-muted)" strokeDasharray="5 5" /> : null}
                <Area
                  type="monotone"
                  dataKey="caloriesTotal"
                  name="Calories"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  fill="var(--color-accent-soft)"
                  fillOpacity={0.7}
                  connectNulls={false}
                  activeDot={{ r: 5, fill: 'var(--color-accent)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {trendsQuery.isLoading ? <p role="status" className="mt-2 text-xs text-muted">Loading your recorded nutrition trend…</p> : null}
          {!trendsQuery.isLoading && !trendData.some((day) => day.caloriesTotal !== null) ? <p className="mt-2 rounded-tile bg-screen p-3 text-xs leading-5 text-muted">No calorie values are available for this period yet. Meals without calorie information remain uncounted.</p> : null}
        </Card>

        <Card className="xl:col-span-5">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-ink">
              <Activity aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">Wellness insights</h2>
              <p className="mt-0.5 text-xs text-muted">A factual snapshot from your saved data</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {dashboardQuery.isLoading ? <p role="status" className="text-sm text-muted">Loading today’s nutrition…</p> : observations.map((observation, index) => (
              <div
                key={observation.title}
                className={`rounded-tile p-4 ${index === 0 ? 'bg-cream' : 'bg-accent-soft/60'}`}
              >
                <h3 className="text-sm font-semibold text-ink">{observation.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-panel">
                  {observation.description}
                </p>
              </div>
            ))}
            <div className="flex gap-3 rounded-tile border border-line p-4">
              <Droplets aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-panel" />
              <div>
                <h3 className="text-sm font-semibold text-ink">Hydration reminder</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  If it suits your routine, take a moment for water the next time you pause.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
            Not medical advice; patterns are associations, not causes.
          </p>
        </Card>
      </section>

      <section aria-labelledby="meals-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              {today}
            </p>
            <h2 id="meals-title" className="mt-1 text-xl font-semibold tracking-tight text-ink">
              Daily meal summary
            </h2>
          </div>
          <Button
            className="h-11"
            icon={ArrowUpRight}
            iconPosition="trailing"
            onClick={() => navigate('/meals')}
            variant="light"
          >
            View meal log
          </Button>
        </div>
        {dashboardQuery.isLoading ? <Card role="status" className="p-6 text-sm text-muted">Loading today’s saved meals…</Card> : null}
        {!dashboardQuery.isLoading && todayMeals.length === 0 ? <Card className="p-6 text-sm text-muted">No meals have been recorded today yet. Add one from your Meal Log or Quick Log.</Card> : null}
        {todayMeals.length > 0 ? <div className="grid gap-3 lg:grid-cols-2">{todayMeals.map((meal) => <MealSummaryRow key={meal.mealId} meal={meal} />)}</div> : null}
      </section>

      <section aria-labelledby="quick-actions-title">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Utensils aria-hidden="true" className="size-4 text-panel" />
            <h2 id="quick-actions-title" className="text-base font-semibold text-ink">
              Quick actions
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              className="h-12 w-full justify-start"
              icon={Utensils}
              onClick={() => navigate('/meals')}
              variant="light"
            >
              Log a meal
            </Button>
            <Button
              className="h-12 w-full justify-start"
              icon={Flame}
              onClick={() => navigate('/quick-log')}
              variant="accent"
            >
              Quick log
            </Button>
            <Button
              className="h-12 w-full justify-start"
              icon={TrendingUp}
              onClick={() => navigate('/patterns')}
              variant="sand"
            >
              View patterns
            </Button>
          </div>
        </Card>
      </section>

      <p className="flex items-center gap-2 pb-2 text-[11px] text-muted">
        <span className="size-1.5 rounded-full bg-accent" />
        Nutrition totals include only values recorded in your saved meals. Missing details remain uncounted.
      </p>
    </main>
  )
}

export default Dashboard
