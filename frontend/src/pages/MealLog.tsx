import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Utensils,
  X,
  PencilLine,
} from 'lucide-react'
import { FoodArt } from '../components/FoodArt'
import { ConfirmDeleteDialog } from '../components/meals/ConfirmDeleteDialog'
import { MealFormDialog } from '../components/meals/MealFormDialog'
import { Badge, Button, Card, IconButton, Input } from '../components/ui'
import { useMealData } from '../context/MealDataContext'
import { useSettings } from '../context/SettingsContext'
import { formatDateKey, getLocalDateKey, getLocalDateTimeBounds, mealDateKey, shiftDateKey } from '../lib/date'
import { useMealList, useMealSummaryForDate } from '../hooks/useMeals'
import type { MealCategory, MealEntry } from '../types/meal'

const mealCategories: Array<{ value: MealCategory; label: string; singular: string }> = [
  { value: 'BREAKFAST', label: 'Breakfast', singular: 'breakfast' },
  { value: 'LUNCH', label: 'Lunch', singular: 'lunch' },
  { value: 'DINNER', label: 'Dinner', singular: 'dinner' },
  { value: 'SNACK', label: 'Snacks', singular: 'snack' },
]

function formatTime(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

function formatAmount(value: number | undefined) {
  if (value === undefined) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

interface NutritionSummaryCardProps {
  label: string
  value: number | null
  goal: number | null | undefined
  unit: string
  accent?: boolean
}

function NutritionSummaryCard({ label, value, goal, unit, accent = false }: NutritionSummaryCardProps) {
  const progress = value === null || typeof goal !== 'number' ? 0 : Math.min((value / goal) * 100, 100)
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted">{label}</p>
        {accent ? <span className="size-2 rounded-full bg-accent" aria-hidden="true" /> : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-[1.7rem]">
        {value === null ? '—' : formatAmount(value)} <span className="text-sm font-medium text-muted">{unit}</span>
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>Your goal preference</span><span>{goal == null ? 'Not set' : `${formatAmount(goal)} ${unit}`}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream" {...(typeof goal === 'number' ? { role: 'progressbar' as const, 'aria-label': `${label} against your configured goal preference`, 'aria-valuemin': 0, 'aria-valuemax': goal, 'aria-valuenow': value === null ? 0 : Math.min(value, goal) } : { 'aria-hidden': true as const })}>
        <div className={`h-full rounded-full ${accent ? 'bg-accent' : 'bg-panel'}`} style={{ width: `${progress}%` }} />
      </div>
    </Card>
  )
}

interface MealRowProps {
  meal: MealEntry
  onEdit: (meal: MealEntry) => void
  onDelete: (meal: MealEntry) => void
}

function MealRow({ meal, onEdit, onDelete }: MealRowProps) {
  return (
    <article className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex min-w-0 items-center gap-3 sm:flex-1">
        <div className="grid size-[4.25rem] shrink-0 place-items-center rounded-tile bg-cream p-1.5 sm:size-[4.5rem]">
          <FoodArt variant={meal.foodArt} title={meal.foodName} className="size-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-ink">{meal.foodName}</h3>
            <Badge variant={meal.logType === 'UNPLANNED' ? 'unplanned' : 'regular'}>
              {meal.logType === 'UNPLANNED' ? 'Unplanned' : 'Regular'}
            </Badge>
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3.5" />{formatTime(meal.loggedAt)}</span>
            <span>{formatAmount(meal.quantity)} {meal.servingUnit}</span>
          </p>
          {meal.notes ? <p className="mt-1 truncate text-xs text-muted">{meal.notes}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-tile bg-screen px-3 py-2.5 text-center sm:min-w-[17rem] sm:bg-transparent sm:px-0 sm:py-0">
        <div><p className="text-sm font-semibold tabular-nums">{formatAmount(meal.calories)}</p><p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">kcal</p></div>
        <div><p className="text-sm font-semibold tabular-nums">{meal.proteinG === undefined ? '—' : `${formatAmount(meal.proteinG)}g`}</p><p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">protein</p></div>
        <div><p className="text-sm font-semibold tabular-nums">{meal.carbsG === undefined ? '—' : `${formatAmount(meal.carbsG)}g`}</p><p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">carbs</p></div>
        <div><p className="text-sm font-semibold tabular-nums">{meal.fatG === undefined ? '—' : `${formatAmount(meal.fatG)}g`}</p><p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">fat</p></div>
      </div>

      <div className="flex justify-end gap-1 sm:justify-start">
        <IconButton icon={PencilLine} aria-label={`Edit ${meal.foodName}`} buttonSize="sm" onClick={() => onEdit(meal)} />
        <IconButton icon={Trash2} aria-label={`Delete ${meal.foodName}`} buttonSize="sm" onClick={() => onDelete(meal)} />
      </div>
    </article>
  )
}

function MealLog() {
  const today = getLocalDateKey()
  const { addMeal, updateMeal, removeMeal } = useMealData()
  const { settings } = useSettings()
  const goals = settings.goals
  const [selectedDate, setSelectedDate] = useState(today)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<MealCategory | 'ALL'>('ALL')
  const [editingMeal, setEditingMeal] = useState<MealEntry | null | 'new'>(null)
  const [deletingMeal, setDeletingMeal] = useState<MealEntry | null>(null)
  const [page, setPage] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState('')
  const dateBounds = getLocalDateTimeBounds(selectedDate)
  const listQuery = useMealList({
    ...dateBounds,
    ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
    ...(categoryFilter !== 'ALL' ? { mealType: categoryFilter } : {}),
    page,
    limit: 25,
    sort: 'asc',
  })
  const summaryQuery = useMealSummaryForDate(selectedDate)
  const dayMeals = listQuery.data?.meals ?? []
  const mealCount = listQuery.data?.pagination.total ?? 0
  const pageCount = listQuery.data?.pagination.totalPages ?? 0
  const totals = {
    calories: summaryQuery.data?.calories.total ?? null,
    proteinG: summaryQuery.data?.proteinG.total ?? null,
    carbsG: summaryQuery.data?.carbsG.total ?? null,
    fatG: summaryQuery.data?.fatG.total ?? null,
  }

  const hasFilters = Boolean(searchQuery.trim()) || categoryFilter !== 'ALL' || selectedDate !== today
  const shownDateLabel = selectedDate === today
    ? `Today, ${formatDateKey(selectedDate, { month: 'short', day: 'numeric' })}`
    : formatDateKey(selectedDate, { month: 'short', day: 'numeric' })

  async function saveMeal(updatedMeal: MealEntry) {
    setActionError('')
    setIsSaving(true)
    try {
      if (editingMeal === 'new') {
        const { mealId: _mealId, ...draft } = updatedMeal
        await addMeal(draft)
      } else if (editingMeal) {
        await updateMeal(updatedMeal)
      }
      setSelectedDate(mealDateKey(updatedMeal.loggedAt))
      setPage(1)
      setEditingMeal(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Meal could not be saved. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deletingMeal) return
    setActionError('')
    setIsDeleting(true)
    try {
      await removeMeal(deletingMeal.mealId)
      setDeletingMeal(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Meal could not be deleted. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  function clearFilters() {
    setSearchQuery('')
    setCategoryFilter('ALL')
    setSelectedDate(today)
    setPage(1)
  }

  return (
    <main className="min-w-0 space-y-7 sm:space-y-8">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-muted">Your nutrition journal</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Meal Log</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">Your daily food journal, thoughtfully organized.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-h-12 items-center justify-between gap-2 rounded-tile border border-line bg-surface px-2 shadow-soft sm:justify-start">
            <IconButton icon={ArrowLeft} aria-label="Previous day" buttonSize="sm" onClick={() => { setSelectedDate((date) => shiftDateKey(date, -1)); setPage(1) }} />
            <div className="flex min-w-36 items-center justify-center gap-2 text-sm font-medium text-ink" aria-live="polite">
              <CalendarDays aria-hidden="true" className="size-4 text-muted" />
              <span>{shownDateLabel}</span>
            </div>
            <IconButton icon={ArrowRight} aria-label="Next day" buttonSize="sm" onClick={() => { setSelectedDate((date) => shiftDateKey(date, 1)); setPage(1) }} />
          </div>
          {selectedDate !== today ? <Button variant="light" onClick={() => { setSelectedDate(today); setPage(1) }}>Today</Button> : null}
          <Button variant="accent" icon={Plus} onClick={() => setEditingMeal('new')}>Add Meal</Button>
        </div>
      </header>

      <Card className="flex items-start gap-3 border border-line bg-cream/70 p-4 shadow-none sm:items-center">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-muted"><Utensils aria-hidden="true" className="size-4" /></div>
        <p className="text-sm leading-6 text-muted"><span className="font-semibold text-ink">Your recorded meals.</span> Nutrition values appear only when provided. Goals are preferences you configure and are not medical prescriptions.</p>
      </Card>

      {actionError || listQuery.error || summaryQuery.error ? <p role="alert" className="rounded-tile border border-accent bg-accent-soft/70 p-4 text-sm text-ink">{actionError || (listQuery.error instanceof Error ? listQuery.error.message : '') || (summaryQuery.error instanceof Error ? summaryQuery.error.message : 'Meal data could not be loaded.')}</p> : null}

      <section aria-labelledby="nutrition-summary-title">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><h2 id="nutrition-summary-title" className="text-lg font-semibold text-ink">Daily nutrition</h2><p className="mt-1 text-sm text-muted">A quick view of what you have logged.</p></div>
          <Badge variant="neutral">{mealCount} {mealCount === 1 ? 'entry' : 'entries'}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          <NutritionSummaryCard label="Calories consumed" value={totals.calories} goal={goals.calories} unit="kcal" accent />
          <NutritionSummaryCard label="Protein" value={totals.proteinG} goal={goals.proteinG} unit="g" />
          <NutritionSummaryCard label="Carbohydrates" value={totals.carbsG} goal={goals.carbsG} unit="g" />
          <NutritionSummaryCard label="Fat" value={totals.fatG} goal={goals.fatG} unit="g" />
        </div>
      </section>

      <section aria-labelledby="journal-title" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><h2 id="journal-title" className="text-lg font-semibold text-ink">Your meals</h2><p className="mt-1 text-sm text-muted">Browse entries for {formatDateKey(selectedDate, { month: 'long', day: 'numeric' })}.</p></div>
          <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_12rem_auto] md:w-auto md:min-w-[35rem]">
            <Input label="Search meals" placeholder="Search food name" leadingIcon={Search} type="search" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1) }} variant="light" className="gap-1.5" inputClassName="py-2" />
            <label className="grid content-start gap-1.5 text-sm font-medium text-ink" htmlFor="category-filter">
              Category
              <span className="relative flex min-h-12 items-center">
                <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-3 size-4 text-muted" />
                <select id="category-filter" value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value as MealCategory | 'ALL'); setPage(1) }} className="min-h-12 w-full rounded-tile border border-line bg-surface pl-10 pr-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent">
                  <option value="ALL">All categories</option>
                  {mealCategories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </span>
            </label>
            {hasFilters ? <Button variant="light" icon={X} onClick={clearFilters} className="self-end">Clear filters</Button> : <span aria-hidden="true" className="hidden md:block" />}
          </div>
        </div>

        {listQuery.isLoading || summaryQuery.isLoading ? <Card className="p-8 text-center text-sm text-muted" role="status">Loading your meals…</Card> : null}
        {!listQuery.isLoading && !summaryQuery.isLoading && !listQuery.error && dayMeals.length === 0 ? (
          <Card className="grid min-h-48 place-items-center text-center">
            <div className="max-w-sm">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-cream text-muted"><Search aria-hidden="true" className="size-5" /></div>
              <h3 className="mt-4 font-semibold text-ink">No meals found</h3>
              <p className="mt-1 text-sm text-muted">Try another search or clear your filters to see this day’s entries.</p>
              {hasFilters ? <Button className="mt-4" variant="light" onClick={clearFilters}>Clear filters</Button> : null}
            </div>
          </Card>
        ) : !listQuery.isLoading ? (
          <div className="space-y-4">
            {mealCategories.filter((category) => categoryFilter === 'ALL' || category.value === categoryFilter).map((category) => {
              const categoryMeals = dayMeals.filter((meal) => meal.mealType === category.value).sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
              if (categoryMeals.length === 0 && searchQuery.trim()) return null
              return (
                <Card key={category.value} className="p-4 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3">
                    <div className="flex items-center gap-2.5"><h3 className="font-semibold text-ink">{category.label}</h3><Badge variant="neutral">{categoryMeals.length}</Badge></div>
                    {categoryMeals.length === 0 ? <span className="text-xs text-muted">No {category.singular} logged</span> : null}
                  </div>
                  {categoryMeals.length > 0 ? <div className="divide-y divide-line">{categoryMeals.map((meal) => <MealRow key={meal.mealId} meal={meal} onEdit={setEditingMeal} onDelete={setDeletingMeal} />)}</div> : null}
                </Card>
              )
            })}
          </div>
        ) : null}
        {pageCount > 1 ? <div className="flex items-center justify-between gap-3 rounded-tile border border-line bg-surface p-3 text-sm text-muted"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><Button variant="light" disabled={page <= 1 || listQuery.isFetching} onClick={() => setPage((current) => Math.max(current - 1, 1))}>Previous</Button><Button variant="light" disabled={page >= pageCount || listQuery.isFetching} onClick={() => setPage((current) => Math.min(current + 1, pageCount))}>Next</Button></div></div> : null}
      </section>

      <p className="text-center text-xs text-muted">Meals and nutrition values are saved to your account and shared across your WELLORA views.</p>

      {editingMeal ? <MealFormDialog meal={editingMeal === 'new' ? undefined : editingMeal} selectedDate={selectedDate} onCancel={() => setEditingMeal(null)} onSave={saveMeal} isSaving={isSaving} saveError={actionError} /> : null}
      {deletingMeal ? <ConfirmDeleteDialog mealName={deletingMeal.foodName} onCancel={() => setDeletingMeal(null)} onConfirm={confirmDelete} isDeleting={isDeleting} error={actionError} /> : null}
    </main>
  )
}

export default MealLog
