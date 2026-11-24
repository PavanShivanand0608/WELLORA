import { useMemo, useState, type ReactNode } from 'react'
import {
  Apple,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Info,
  Leaf,
  Lightbulb,
  Sprout,
  ThumbsDown,
  ThumbsUp,
  Utensils,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, Chip } from '../components/ui'
import type { FoodRecommendation, RecommendationCategory, RecommendationPlan } from '../api/recommendations'
import { useRecommendationActions, useRecommendations, useSavedRecommendations } from '../hooks/useRecommendations'

type FeedbackValue = 'helpful' | 'not-relevant'
type RecommendationFilter = 'All' | RecommendationCategory
const recommendationCategories: RecommendationCategory[] = ['Protein', 'Fibre', 'Fruit & veg', 'Balanced meals', 'Snack ideas', 'Eating patterns']

const categoryIcons: Record<RecommendationCategory, typeof Apple> = {
  Protein: Sprout,
  Fibre: Leaf,
  'Fruit & veg': Apple,
  'Balanced meals': Utensils,
  'Snack ideas': Clock3,
  'Eating patterns': Lightbulb,
}

function SuggestionCard({
  recommendation,
  feedback,
  saved,
  detailsOpen,
  onFeedback,
  onToggleSave,
  onToggleDetails,
}: {
  recommendation: FoodRecommendation
  feedback: FeedbackValue | undefined
  saved: boolean
  detailsOpen: boolean
  onFeedback: (value: FeedbackValue) => void
  onToggleSave: () => void
  onToggleDetails: () => void
}) {
  const Icon = categoryIcons[recommendation.category]
  const detailId = `recommendation-details-${recommendation.id}`

  return (
    <Card className="flex min-w-0 flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-accent-soft text-ink">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="flex min-w-0 flex-wrap justify-end gap-1.5">
          <Badge variant={recommendation.source === 'personalized' ? 'unplanned' : 'neutral'}>
            {recommendation.source === 'personalized' ? 'Personalized' : 'General idea'}
          </Badge>
          <Badge variant="regular">{recommendation.category}</Badge>
        </div>
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">{recommendation.title}</h3>
      <p className="mt-1 text-sm font-medium leading-6 text-panel">{recommendation.foodIdea}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{recommendation.description}</p>

      <div className="mt-4 rounded-tile border border-line bg-screen p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">Why this is here</p>
        <p className="mt-1.5 text-xs leading-5 text-ink">{recommendation.whySuggested}</p>
      </div>

      <button
        type="button"
        aria-expanded={detailsOpen}
        aria-controls={detailId}
        onClick={onToggleDetails}
        className="mt-3 inline-flex min-h-10 items-center gap-1.5 self-start rounded-lg px-2 text-xs font-semibold text-panel transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {detailsOpen ? 'Hide details' : 'View details'}
        {detailsOpen ? <ChevronUp aria-hidden="true" className="size-4" /> : <ChevronDown aria-hidden="true" className="size-4" />}
      </button>

      <div id={detailId} hidden={!detailsOpen} className="mt-1 space-y-3 border-l-2 border-accent pl-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">Observed pattern</p>
            <p className="mt-1 text-xs leading-5 text-ink">{recommendation.observedPattern}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">A practical way to try it</p>
            <p className="mt-1 text-xs leading-5 text-ink">{recommendation.prepIdea}</p>
          </div>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label={`Feedback for ${recommendation.title}`}>
          <Button
            aria-pressed={feedback === 'helpful'}
            className="min-h-10 px-3 text-xs"
            icon={ThumbsUp}
            onClick={() => onFeedback('helpful')}
            variant={feedback === 'helpful' ? 'accent' : 'light'}
          >
            Helpful
          </Button>
          <Button
            aria-pressed={feedback === 'not-relevant'}
            className="min-h-10 px-3 text-xs"
            icon={ThumbsDown}
            onClick={() => onFeedback('not-relevant')}
            variant={feedback === 'not-relevant' ? 'sand' : 'light'}
          >
            Not relevant
          </Button>
          <Button
            aria-pressed={saved}
            className="min-h-10 px-3 text-xs"
            icon={saved ? BookmarkCheck : Bookmark}
            onClick={onToggleSave}
            variant="light"
          >
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>
        {feedback || saved ? (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
            <Check aria-hidden="true" className="size-3.5" />
            {saved && feedback ? `Saved to your account · marked ${feedback === 'helpful' ? 'helpful' : 'not relevant'}` : saved ? 'Saved to your account' : feedback === 'helpful' ? 'Feedback saved' : 'Feedback saved'}
          </p>
        ) : null}
      </div>
    </Card>
  )
}

function CoverageItem({
  label,
  value,
  detail,
  percentage,
}: {
  label: string
  value: string
  detail: string
  percentage: number
}) {
  return (
    <div className="min-w-0 rounded-tile border border-line bg-screen p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-xs font-semibold text-ink">{label}</p>
        <p className="shrink-0 text-xs font-semibold tabular-nums text-panel">{value}</p>
      </div>
      <p className="mt-1 text-[11px] leading-4 text-muted">{detail}</p>
      <div aria-label={`${label} recorded data coverage`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, description }: { icon: typeof Apple; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-cream text-panel"><Icon aria-hidden="true" className="size-5" /></span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
      </div>
    </div>
  )
}

function FilterBar({
  selected,
  onSelect,
}: {
  selected: RecommendationFilter
  onSelect: (filter: RecommendationFilter) => void
}) {
  const filters: RecommendationFilter[] = ['All', ...recommendationCategories]
  return (
    <div aria-label="Filter recommendations by category" className="flex flex-wrap gap-2" role="group">
      {filters.map((filter) => (
        <Chip key={filter} selected={selected === filter} onClick={() => onSelect(filter)} className="min-h-10 px-3 text-xs sm:text-sm">
          {filter}
        </Chip>
      ))}
    </div>
  )
}

function Recommendations() {
  const planQuery = useRecommendations()
  const savedQuery = useSavedRecommendations()
  const actions = useRecommendationActions()
  const plan = planQuery.data
  const [filter, setFilter] = useState<RecommendationFilter>('All')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [actionMessage, setActionMessage] = useState('')
  const matchesFilter = (recommendation: FoodRecommendation) => filter === 'All' || recommendation.category === filter
  const personalized = useMemo(() => (plan?.personalized ?? []).filter(matchesFilter), [plan, filter])
  const general = useMemo(() => (plan?.general ?? []).filter(matchesFilter), [plan, filter])
  const saved = useMemo(() => (savedQuery.data ?? []).filter(matchesFilter), [savedQuery.data, filter])
  const feedbackCount = [...(plan?.personalized ?? []), ...(plan?.general ?? [])].filter((item) => item.feedback !== undefined).length

  async function updateFeedback(id: string, value: FeedbackValue, current: FeedbackValue | undefined) {
    const active = current === value
    try {
      await actions.feedback.mutateAsync({ id, helpful: value === 'helpful' ? !active : false, relevant: value === 'not-relevant' ? !active : true })
      setActionMessage(active ? 'Your feedback was updated.' : value === 'helpful' ? 'Thanks, your feedback was saved.' : 'Thanks, your feedback was saved.')
    } catch (error) {
      setActionMessage(error instanceof Error ? `Feedback could not be saved: ${error.message}` : 'Feedback could not be saved. Please try again.')
    }
  }

  async function toggleSaved(recommendation: FoodRecommendation) {
    try {
      await actions.saving.mutateAsync({ id: recommendation.id, saved: !recommendation.saved })
      setActionMessage(recommendation.saved ? 'Recommendation removed from your saved list.' : 'Recommendation saved to your account.')
    } catch (error) {
      setActionMessage(error instanceof Error ? `This recommendation could not be saved: ${error.message}` : 'This recommendation could not be saved. Please try again.')
    }
  }

  function toggleDetails(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function renderCards(items: FoodRecommendation[]): ReactNode {
    const uniqueItems = [...new Map(items.map((recommendation) => [recommendation.id, recommendation])).values()]
    return uniqueItems.map((recommendation) => {
      const feedback: FeedbackValue | undefined = recommendation.feedback?.helpful === true
        ? 'helpful'
        : recommendation.feedback?.relevant === false ? 'not-relevant' : undefined
      return (
        <SuggestionCard
          key={`${recommendation.source}-${recommendation.id}`}
          recommendation={recommendation}
          feedback={feedback}
          saved={recommendation.saved}
          detailsOpen={expandedIds.has(recommendation.id)}
          onFeedback={(value) => void updateFeedback(recommendation.id, value, feedback)}
          onToggleSave={() => void toggleSaved(recommendation)}
          onToggleDetails={() => toggleDetails(recommendation.id)}
        />
      )
    })
  }

  const planForEmpty: RecommendationPlan = {
    period: { days: 30, startDate: '', endDate: '' }, mealCount: 0, personalized: [], general: [], nutritionCoverage: [], observations: [], hasEnoughHistory: false,
  }
  const currentPlan = plan ?? planForEmpty

  return (
    <main className="min-w-0 space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted">Thoughtful food guidance</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">Recommendations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            Explore practical food suggestions informed by your recorded habits.
          </p>
        </div>
        <Badge variant="neutral" className="self-start sm:self-auto">{currentPlan.mealCount} entries · last 30 days</Badge>
      </header>

      {planQuery.isLoading || savedQuery.isLoading ? <Card role="status" className="p-4 text-sm text-muted">Loading your saved recommendations and meal history…</Card> : null}
      {planQuery.error ? <p role="alert" className="rounded-tile border border-accent bg-accent-soft/70 p-4 text-sm text-ink">Recommendations could not be loaded: {planQuery.error.message}</p> : null}
      {savedQuery.error ? <p role="alert" className="rounded-tile border border-accent bg-accent-soft/70 p-4 text-sm text-ink">Your saved recommendations could not be loaded: {savedQuery.error.message}</p> : null}

      <Card className="overflow-hidden border border-line p-0">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)]">
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted"><Lightbulb aria-hidden="true" className="size-4 text-panel" /> Today’s suggestions</div>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Small ideas, grounded in what you’ve logged.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Personalized ideas appear only when your recent entries support them. General food ideas are available separately, without assumptions about your preferences or needs.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to="/quick-log" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-tile bg-panel px-4 text-sm font-semibold text-surface transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                <Utensils aria-hidden="true" className="size-4" /> Add a meal entry
              </Link>
              <span className="text-xs text-muted">{savedQuery.data?.length ?? 0} saved to your account</span>
            </div>
          </div>
          <div className="border-t border-line bg-cream/70 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-full bg-surface text-ink"><Info aria-hidden="true" className="size-4" /></span><h3 className="text-sm font-semibold text-ink">How suggestions work</h3></div>
            <p className="mt-3 text-xs leading-5 text-muted">Personalized suggestions use valid meal records from the last 30 days. Missing nutrition values remain unknown. These are practical food ideas, not a diet plan or medical guidance.</p>
            <p className="mt-3 text-xs leading-5 text-muted">Your feedback and saved ideas are stored with your account and remain private to it.</p>
          </div>
        </div>
      </Card>

      <section aria-label="Food balance insights" className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card className="min-w-0 p-4 sm:p-6">
          <SectionTitle icon={Sprout} title="Food balance insights" description="What your nutrition entries include—and what is not currently tracked." />
          {currentPlan.mealCount ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {currentPlan.nutritionCoverage.map((item) => {
                  const percentage = item.mealCount ? Math.round((item.recordedEntries / item.mealCount) * 100) : 0
                  return (
                    <CoverageItem
                      key={item.key}
                      label={item.label}
                      value={item.averageKnown === null ? 'Unknown' : `${Math.round(item.averageKnown)} ${item.unit} avg.`}
                      detail={item.recordedEntries ? `Entered for ${item.recordedEntries} of ${item.mealCount} meals; blanks are unknown.` : `No ${item.label.toLowerCase()} values entered.`}
                      percentage={percentage}
                    />
                  )
                })}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-tile border border-line bg-screen p-3.5">
                  <p className="text-xs font-semibold text-ink">Fibre</p>
                  <p className="mt-1 text-[11px] leading-4 text-muted">Fibre is not a current Meal Log field, so fibre-rich ideas below are general food examples.</p>
                </div>
                <div className="rounded-tile border border-line bg-screen p-3.5">
                  <p className="text-xs font-semibold text-ink">Fruit and vegetables</p>
                  <p className="mt-1 text-[11px] leading-4 text-muted">Ingredient amounts are not structured in your log; variety ideas are not based on an inferred gap.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-tile border border-dashed border-line bg-screen p-4 text-sm leading-6 text-muted">
              No recent meals to review yet. Nutrition values will be summarized only when they are entered.
            </div>
          )}
        </Card>

        <Card className="min-w-0 p-4 sm:p-6">
          <SectionTitle icon={Clock3} title="Eating-pattern observations" description="Neutral notes from entries recorded during the last 30 days." />
          {currentPlan.observations.length ? (
            <ul className="mt-5 space-y-2.5">
              {currentPlan.observations.map((observation) => (
                <li key={observation.title} className="flex gap-3 rounded-tile bg-screen p-3.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-ink"><Check aria-hidden="true" className="size-3.5" /></span>
                  <div className="min-w-0"><p className="text-xs font-semibold text-ink">{observation.title}</p><p className="mt-1 text-xs leading-5 text-muted">{observation.detail}</p></div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-tile border border-dashed border-line bg-screen p-4">
              <p className="text-sm font-semibold text-ink">More entries will make patterns clearer</p>
              <p className="mt-1 text-xs leading-5 text-muted">There is not enough recent meal history to describe an eating pattern yet.</p>
            </div>
          )}
          <p className="mt-4 text-[11px] leading-5 text-muted">Observed patterns describe what was recorded; they do not explain why it happened.</p>
        </Card>
      </section>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionTitle icon={Lightbulb} title="Suggestions for you" description="Each personalized idea includes the record that led to it." />
          </div>
          <FilterBar selected={filter} onSelect={setFilter} />
        </div>
        <p aria-live="polite" className="sr-only">{actionMessage}</p>

        {personalized.length ? (
          <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {renderCards(personalized)}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4 rounded-tile border border-dashed border-line bg-screen p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">{currentPlan.hasEnoughHistory ? 'No supported suggestion in this category yet' : 'A little more meal history will help'}</h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
                {currentPlan.hasEnoughHistory
                  ? 'The current entries do not support a clear recommendation here. General food ideas are listed below.'
                  : 'Personalized suggestions need at least a few recent entries. General food ideas remain available below.'}
              </p>
            </div>
            <Link to="/quick-log" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-tile border border-line bg-surface px-4 text-xs font-semibold text-ink transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Log a meal</Link>
          </div>
        )}
      </Card>

      <section aria-labelledby="general-ideas-title" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">For inspiration</p>
            <h2 id="general-ideas-title" className="mt-1 text-xl font-semibold tracking-tight text-ink">General food ideas</h2>
            <p className="mt-1 text-sm text-muted">These options are examples, not inferred preferences or personal nutrition advice.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Info aria-hidden="true" className="size-4" /> Available with or without meal history</span>
        </div>

        {general.length ? (
          <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {renderCards(general)}
          </div>
        ) : (
          <Card className="p-5 text-sm text-muted">No general food ideas match this category.</Card>
        )}
      </section>

      {saved.length ? (
        <section aria-labelledby="saved-recommendations-title" className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Your collection</p>
            <h2 id="saved-recommendations-title" className="mt-1 text-xl font-semibold tracking-tight text-ink">Saved for later</h2>
            <p className="mt-1 text-sm text-muted">These saved snapshots remain available even if your recent patterns change.</p>
          </div>
          <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">{renderCards(saved)}</div>
        </section>
      ) : null}
      {feedbackCount ? <p role="status" className="text-center text-xs text-muted">Feedback has been saved for {feedbackCount} recommendation{feedbackCount === 1 ? '' : 's'}.</p> : null}
    </main>
  )
}

export default Recommendations
