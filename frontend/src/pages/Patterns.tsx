import { useMemo, useState } from 'react'
import {
  Activity,
  CalendarDays,
  Clock3,
  HeartHandshake,
  Info,
  Leaf,
  Sparkles,
  Utensils,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui'
import { formatDateKey, getDateKeyInTimezone, shiftDateKey } from '../lib/date'
import { usePatternAnalytics } from '../hooks/useAnalytics'
import { useSettings } from '../context/SettingsContext'
import {
  eatingCueOptions,
  generatePatternInsights,
  type CountItem,
  type PatternRange,
} from '../lib/patternAnalytics'

const chartColors = ['#FF9F70', '#D6CBC2', '#2A2A2A', '#E6E0D6', '#8A8580', '#FFE3D3', '#F4F0E9', '#1E1E1E']
const tooltipStyle = {
  border: '1px solid #ECE6DC',
  borderRadius: 12,
  boxShadow: '0 6px 24px rgba(30,30,30,0.06)',
  fontFamily: 'inherit',
  fontSize: 12,
}

const rangeOptions: Array<{ value: PatternRange; label: string }> = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
]

function formatRange(start: string, end: string, timezone: string) {
  return `${formatDateKey(start, { month: 'short', day: 'numeric' }, timezone)} – ${formatDateKey(end, { month: 'short', day: 'numeric', year: 'numeric' }, timezone)}`
}

function periodChange(current: number, previous: number) {
  const difference = current - previous
  if (difference === 0) return 'Same as previous period'
  return `${difference > 0 ? '+' : ''}${difference} vs previous period`
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity
  label: string
  value: string
  detail: string
}) {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-accent-soft text-ink">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <p className="min-w-0 text-sm font-medium text-muted">{label}</p>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </Card>
  )
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Activity
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream text-panel">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <h2 className="font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
    </div>
  )
}

function DistributionRows({ items, showPercentage = true }: { items: CountItem[]; showPercentage?: boolean }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, index) => {
        const cueColorIndex = eatingCueOptions.findIndex((cue) => cue.value === item.key)
        const colorIndex = cueColorIndex >= 0 ? cueColorIndex : index
        return (
          <li key={item.key} className="flex items-center gap-3 text-xs">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[colorIndex % chartColors.length] }} />
            <span className="min-w-0 flex-1 truncate text-muted">{item.label}</span>
            <span className="font-semibold tabular-nums text-ink">{item.count}</span>
            {showPercentage ? <span className="w-10 text-right tabular-nums text-muted">{item.percentage}%</span> : null}
          </li>
        )
      })}
    </ul>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-tile border border-dashed border-line bg-screen px-5 py-8 text-center">
      <div>
        <span className="mx-auto grid size-10 place-items-center rounded-full bg-cream text-muted"><Info aria-hidden="true" className="size-5" /></span>
        <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{message}</p>
      </div>
    </div>
  )
}

function Patterns() {
  const { settings, isLoading: settingsLoading } = useSettings()
  const timezone = settings.applicationPreferences.timezone || 'UTC'
  const [mountedAt] = useState(() => new Date())
  const today = getDateKeyInTimezone(mountedAt, timezone)
  const [range, setRange] = useState<PatternRange>(7)
  const [customRange, setCustomRange] = useState(false)
  const [customStartOverride, setCustomStartOverride] = useState<string | null>(null)
  const [customEndOverride, setCustomEndOverride] = useState<string | null>(null)
  const customStart = customStartOverride ?? shiftDateKey(today, -6)
  const customEnd = customEndOverride ?? today
  const params = customRange
    ? { startDate: customStart, endDate: customEnd, timezone }
    : { range, timezone }
  const analyticsQuery = usePatternAnalytics(params, !settingsLoading)
  const analytics = analyticsQuery.data
  const insights = useMemo(() => analytics ? generatePatternInsights(analytics) : [], [analytics])
  const displayStart = analytics?.startDate ?? (customRange ? customStart : shiftDateKey(today, -(range - 1)))
  const displayEnd = analytics?.endDate ?? (customRange ? customEnd : today)
  const dateDescription = formatRange(displayStart, displayEnd, timezone)
  const previousDescription = analytics ? formatRange(analytics.previousStartDate, analytics.previousEndDate, timezone) : ''
  const header = (
    <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted">Your wellness journey</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">Patterns</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Understand your eating habits through thoughtful observations and trends.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
          <CalendarDays aria-hidden="true" className="size-4" /> {dateDescription}
        </span>
        <div aria-label="Analytics date range" className="inline-flex w-full rounded-tile border border-line bg-surface p-1 sm:w-auto" role="group">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={!customRange && range === option.value}
              onClick={() => { setRange(option.value); setCustomRange(false) }}
              className={`min-h-10 flex-1 rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-none ${!customRange && range === option.value ? 'bg-panel text-surface' : 'text-muted hover:bg-cream hover:text-ink'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="patterns-start-date">Custom start date</label>
          <input id="patterns-start-date" aria-label="Custom start date" type="date" value={customStart} max={customEnd} onChange={(event) => { setCustomStartOverride(event.target.value); setCustomRange(true) }} className="min-h-10 min-w-0 rounded-xl border border-line bg-surface px-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
          <label className="sr-only" htmlFor="patterns-end-date">Custom end date</label>
          <input id="patterns-end-date" aria-label="Custom end date" type="date" value={customEnd} min={customStart} max={today} onChange={(event) => { setCustomEndOverride(event.target.value); setCustomRange(true) }} className="min-h-10 min-w-0 rounded-xl border border-line bg-surface px-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
        </div>
      </div>
    </header>
  )

  if (!analytics) {
    return (
      <main className="min-w-0 space-y-6 sm:space-y-8">
        {header}
        {settingsLoading || analyticsQuery.isLoading ? <Card role="status" className="p-6 text-sm text-muted">Loading your saved eating patterns…</Card> : null}
        {analyticsQuery.error ? <p role="alert" className="rounded-tile border border-accent bg-accent-soft/70 p-4 text-sm text-ink">{analyticsQuery.error.message}</p> : null}
      </main>
    )
  }
  const hasData = analytics.mealCount > 0
  const cueTagged = analytics.cueTaggedCount > 0
  const hungerRecorded = analytics.hungerCount > 0
  const hasMoodData = analytics.moodBeforeDistribution.length > 0 || analytics.moodAfterDistribution.length > 0
  const daysWithHunger = analytics.dailyTrend.filter((point) => point.averageHunger !== null).length
  const moodKeys = [...new Set([
    ...analytics.moodBeforeDistribution.map((item) => item.key),
    ...analytics.moodAfterDistribution.map((item) => item.key),
  ])]
  const moodChartData = moodKeys.map((key) => ({
    mood: analytics.moodBeforeDistribution.find((item) => item.key === key)?.label
      ?? analytics.moodAfterDistribution.find((item) => item.key === key)?.label ?? key,
    before: analytics.moodBeforeDistribution.find((item) => item.key === key)?.count ?? 0,
    after: analytics.moodAfterDistribution.find((item) => item.key === key)?.count ?? 0,
  }))

  return (
    <main className="min-w-0 space-y-6 sm:space-y-8">
      {header}
      {analyticsQuery.isFetching ? <p role="status" className="text-xs text-muted">Updating this period’s analytics…</p> : null}
      {analyticsQuery.error ? <p role="alert" className="rounded-tile border border-accent bg-accent-soft/70 p-4 text-sm text-ink">{analyticsQuery.error.message}</p> : null}

      <div className="flex items-start gap-2 rounded-tile border border-line bg-surface px-4 py-3 text-xs leading-5 text-muted">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>Based on saved meals from {dateDescription}. Results are aggregated from your authenticated account; optional details that were not recorded are excluded.</p>
      </div>

      <section aria-label="Period summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Utensils} label="Meals recorded" value={String(analytics.mealCount)} detail={periodChange(analytics.mealCount, analytics.previousMealCount)} />
        <SummaryCard icon={Sparkles} label="Unplanned meals" value={String(analytics.unplannedCount)} detail={periodChange(analytics.unplannedCount, analytics.previousUnplannedCount)} />
        <SummaryCard icon={Activity} label="Entries with a cue" value={String(analytics.cueTaggedCount)} detail={periodChange(analytics.cueTaggedCount, analytics.previousCueTaggedCount)} />
        <SummaryCard icon={HeartHandshake} label="Average hunger" value={analytics.averageHunger === null ? '—' : `${analytics.averageHunger.toFixed(1)} / 5`} detail={analytics.hungerCount ? `${analytics.hungerCount} recorded check-ins` : 'No hunger levels recorded'} />
      </section>

      {!hasData ? (
        <Card className="overflow-hidden border border-line bg-surface p-6 sm:p-9">
          <div className="mx-auto max-w-lg text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-ink"><Leaf aria-hidden="true" className="size-6" /></span>
            <h2 className="mt-4 text-xl font-semibold text-ink">No entries in this period yet</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {`There are no meal entries between ${dateDescription}. Choose a longer range or add an entry to begin seeing your own recorded patterns.`}
            </p>
            <Link to="/quick-log" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-tile bg-panel px-5 text-sm font-semibold text-surface transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              Log a meal
            </Link>
          </div>
        </Card>
      ) : null}

      {hasData ? (
        <>
          <Card className="min-w-0 overflow-hidden p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeading icon={Activity} title="Eating rhythm over time" description={`Daily meal and cue counts across the selected ${analytics.range}-day period.`} />
              <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-muted">Compared with {previousDescription}</span>
            </div>
            <div role="img" aria-label={`Daily meal counts, unplanned meal counts, recorded cues and average hunger for ${rangeDescription(analytics.range)}`} className="mt-5 h-[280px] min-w-0 w-full sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.dailyTrend} margin={{ top: 10, right: 4, bottom: 4, left: -18 }}>
                  <CartesianGrid stroke="#ECE6DC" vertical={false} />
                  <XAxis dataKey="label" interval={analytics.range <= 7 ? 0 : analytics.range <= 30 ? 4 : 14} tick={{ fill: '#8A8580', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="count" allowDecimals={false} width={32} tick={{ fill: '#8A8580', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="hunger" orientation="right" domain={[0, 5]} width={28} tick={{ fill: '#8A8580', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar yAxisId="count" dataKey="regularCount" name="Regular meals" stackId="meals" fill="#D6CBC2" maxBarSize={24} />
                  <Bar yAxisId="count" dataKey="unplannedCount" name="Unplanned meals" stackId="meals" fill="#FF9F70" maxBarSize={24} />
                  <Line yAxisId="count" type="monotone" dataKey="cueCount" name="Recorded cues" stroke="#2A2A2A" strokeWidth={2} dot={false} connectNulls />
                  <Line yAxisId="hunger" type="monotone" dataKey="averageHunger" name="Average hunger (1–5)" stroke="#8A8580" strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 rounded-tile bg-screen px-3 py-2.5 text-xs leading-5 text-muted">
              {analytics.mealCount} meals recorded, including {analytics.unplannedCount} unplanned. {analytics.cueTaggedCount} entries include a cue and {analytics.hungerCount} include a hunger level. This summarizes recorded information only.
            </p>
          </Card>

          <section aria-label="Eating cue and hunger analyses" className="grid min-w-0 gap-5 xl:grid-cols-2">
            <Card className="min-w-0 p-4 sm:p-6">
              <SectionHeading icon={Sparkles} title="Eating cue analysis" description="How often each cue was selected in Quick Log." />
              {cueTagged ? (
                <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.85fr)] md:items-center">
                  <div role="img" aria-label="Donut chart of recorded eating cue counts" className="h-[230px] min-w-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analytics.cueDistribution.filter((item) => item.count > 0)} dataKey="count" nameKey="label" innerRadius={58} outerRadius={86} paddingAngle={2}>
                          {analytics.cueDistribution.filter((item) => item.count > 0).map((item) => (
                            <Cell key={item.key} fill={chartColors[eatingCueOptions.findIndex((cue) => cue.value === item.key) % chartColors.length]} stroke="#FFFFFF" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(value, _name, item) => [`${value} (${(item.payload as CountItem).percentage}%)`, (item.payload as CountItem).label]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <DistributionRows items={analytics.cueDistribution.filter((item) => item.count > 0)} />
                </div>
              ) : <EmptyChart message="No eating cues were recorded in this period. A cue selected in Quick Log will appear here." />}
              <p className="mt-2 text-xs text-muted">Percentages use only the {analytics.cueTaggedCount} entries with a recorded cue.</p>
            </Card>

            <Card className="min-w-0 p-4 sm:p-6">
              <SectionHeading icon={HeartHandshake} title="Hunger level check-ins" description="The 1–5 levels recorded alongside meals." />
              {hungerRecorded ? (
                <>
                  <div role="img" aria-label="Bar chart of recorded hunger level distribution" className="mt-4 h-[225px] min-w-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.hungerDistribution} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                        <CartesianGrid stroke="#ECE6DC" vertical={false} />
                        <XAxis dataKey="key" tickFormatter={(value) => `Level ${value}`} tick={{ fill: '#8A8580', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} width={30} tick={{ fill: '#8A8580', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(value, _name, item) => [value, (item.payload as CountItem).label]} />
                        <Bar dataKey="count" name="Entries" fill="#FF9F70" radius={[7, 7, 0, 0]} maxBarSize={42} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 rounded-tile bg-screen p-3">
                    <div><p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Most common</p><p className="mt-1 text-sm font-semibold text-ink">{analytics.mostCommonHunger ?? 'Shared levels'}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Period change</p><p className="mt-1 text-sm font-semibold text-ink">{daysWithHunger < 2 || analytics.dailyHungerRange.change === null ? 'Need check-ins on 2 days' : analytics.dailyHungerRange.change === 0 ? 'No change between recorded days' : `${analytics.dailyHungerRange.change > 0 ? '+' : ''}${analytics.dailyHungerRange.change.toFixed(1)} level`}</p></div>
                  </div>
                  <DistributionRows items={analytics.hungerDistribution} showPercentage={false} />
                </>
              ) : <EmptyChart message="Hunger levels are optional. Record a check-in in Quick Log to see your distribution." />}
            </Card>
          </section>

          <section aria-label="Meal timing and mood analyses" className="grid min-w-0 gap-5 xl:grid-cols-2">
            <Card className="min-w-0 p-4 sm:p-6">
              <SectionHeading icon={Clock3} title="Meal timing patterns" description="Recorded meal categories and the times they occurred." />
              <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Meals by category</h3>
                  <div role="img" aria-label="Bar chart of meals by breakfast, lunch, dinner and snacks" className="mt-2 h-[190px] min-w-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.mealCategoryDistribution} margin={{ top: 8, right: 2, bottom: 0, left: -23 }}>
                        <CartesianGrid stroke="#ECE6DC" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#8A8580', fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} width={28} tick={{ fill: '#8A8580', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" name="Meals" fill="#D6CBC2" radius={[6, 6, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <DistributionRows items={analytics.mealCategoryDistribution} showPercentage={false} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Meals by time of day</h3>
                  <div role="img" aria-label="Bar chart of meal counts by time of day" className="mt-2 h-[190px] min-w-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.daypartDistribution} margin={{ top: 8, right: 2, bottom: 0, left: -23 }}>
                        <CartesianGrid stroke="#ECE6DC" vertical={false} />
                        <XAxis dataKey="label" interval={0} angle={-22} textAnchor="end" height={48} tick={{ fill: '#8A8580', fontSize: 8 }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} width={28} tick={{ fill: '#8A8580', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" name="Meals" fill="#FF9F70" radius={[6, 6, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Most common exact times</p>
                    {analytics.commonHours.length ? analytics.commonHours.slice(0, 3).map((item) => (
                      <div key={item.hour} className="flex justify-between gap-2 text-xs"><span className="text-muted">Around {item.label}</span><span className="font-semibold tabular-nums text-ink">{item.count}</span></div>
                    )) : <p className="text-xs text-muted">No times recorded.</p>}
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-tile bg-screen p-4">
                <div className="flex items-center justify-between gap-3">
                  <div><h3 className="text-sm font-semibold text-ink">Unplanned meal timing</h3><p className="mt-1 text-xs text-muted">Distribution across the recorded dayparts.</p></div>
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-ink">{analytics.unplannedCount} total</span>
                </div>
                {analytics.unplannedCount ? <DistributionRows items={analytics.unplannedDaypartDistribution} showPercentage /> : <p className="mt-3 text-xs text-muted">No unplanned entries in this period.</p>}
              </div>
            </Card>

            <Card className="min-w-0 p-4 sm:p-6">
              <SectionHeading icon={HeartHandshake} title="Mood & eating behaviour" description="Mood labels and eating cues recorded together. These are associations, not cause-and-effect claims." />
              {hasMoodData ? (
                <>
                  <div role="img" aria-label="Grouped bar chart showing recorded mood labels before and after meals" className="mt-4 h-[240px] min-w-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={moodChartData} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                        <CartesianGrid stroke="#ECE6DC" vertical={false} />
                        <XAxis dataKey="mood" interval={0} angle={-18} textAnchor="end" height={48} tick={{ fill: '#8A8580', fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} width={28} tick={{ fill: '#8A8580', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="before" name="Before eating" fill="#D6CBC2" radius={[5, 5, 0, 0]} maxBarSize={30} />
                        <Bar dataKey="after" name="After eating" fill="#FF9F70" radius={[5, 5, 0, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 rounded-tile bg-screen p-3">
                    <p className="text-xs leading-5 text-muted"><span className="block font-semibold text-ink">{analytics.moodBeforeDistribution.reduce((sum, item) => sum + item.count, 0)} before</span>Mood labels recorded before eating</p>
                    <p className="text-xs leading-5 text-muted"><span className="block font-semibold text-ink">{analytics.moodAfterDistribution.reduce((sum, item) => sum + item.count, 0)} after</span>Mood labels recorded after eating</p>
                  </div>
                  {analytics.moodTransitionCount ? <p className="mt-3 text-xs leading-5 text-muted">For {analytics.moodTransitionCount} entries with both fields, {analytics.moodSameCount} had the same mood label and {analytics.moodDifferentCount} had different labels. No causal interpretation is implied.</p> : <p className="mt-3 text-xs leading-5 text-muted">No entries include both mood fields yet, so before/after pairs are not compared.</p>}
                  <div className="mt-5 border-t border-line pt-4">
                    <h3 className="text-sm font-semibold text-ink">Cues recorded with mood before eating</h3>
                    {analytics.cueMoodAssociations.length ? (
                      <ul className="mt-3 space-y-2">
                        {analytics.cueMoodAssociations.map((item) => <li key={`${item.cue}-${item.mood}`} className="flex flex-wrap items-center justify-between gap-2 rounded-tile bg-screen px-3 py-2 text-xs"><span className="text-muted">{item.cueLabel} <span aria-hidden="true">·</span> {item.mood}</span><span className="font-semibold text-ink">{item.count} {item.count === 1 ? 'entry' : 'entries'}</span></li>)}
                      </ul>
                    ) : <p className="mt-2 text-xs leading-5 text-muted">No entries recorded both a cue and a before-eating mood.</p>}
                  </div>
                </>
              ) : <EmptyChart message="Mood is optional. Mood charts will appear only after a before or after mood has actually been recorded." />}
            </Card>
          </section>

          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-accent-soft text-ink"><Sparkles aria-hidden="true" className="size-5" /></span>
              <div><h2 className="font-semibold text-ink">Thoughtful observations</h2><p className="mt-1 text-xs leading-5 text-muted">Generated from entries in the selected period. They describe recorded associations only.</p></div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {insights.map((insight, index) => (
                <article key={insight.title} className="rounded-tile border border-line bg-screen p-4">
                  <span className="grid size-8 place-items-center rounded-full bg-surface text-muted">{index === 0 ? <Sparkles aria-hidden="true" className="size-4" /> : index === 1 ? <Clock3 aria-hidden="true" className="size-4" /> : <Activity aria-hidden="true" className="size-4" />}</span>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{insight.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted">{insight.description}</p>
                </article>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-tile bg-accent-soft text-ink"><Sparkles aria-hidden="true" className="size-5" /></span><div><h2 className="font-semibold text-ink">Thoughtful observations</h2><p className="mt-1 text-xs leading-5 text-muted">{insights[0]?.description}</p></div></div>
        </Card>
      )}

    </main>
  )
}

function rangeDescription(range: number) {
  return `the selected ${range}-day period`
}

export default Patterns
