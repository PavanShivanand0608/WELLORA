import { useRef, useState, type FormEvent } from 'react'
import {
  Apple,
  ArrowLeft,
  Brain,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Coffee,
  Heart,
  RotateCcw,
  Sparkles,
  Users,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FoodArt } from '../components/FoodArt'
import { Badge, Button, Card, Chip, Input } from '../components/ui'
import { useMealData } from '../context/MealDataContext'
import { getLocalDateKey, getLocalTimeKey } from '../lib/date'
import type { EatingCue, EatingCueDetail, HungerLevel, MealCategory } from '../types/meal'

interface QuickLogValues {
  foodName: string
  mealType: MealCategory | ''
  date: string
  time: string
  quantity: string
  servingUnit: string
  calories: string
  eatingCue: EatingCueDetail | ''
  hungerLevel: HungerLevel | null
  moodBefore: string
  moodAfter: string
  notes: string
  context: string
}

type QuickLogErrors = Partial<Record<keyof QuickLogValues, string>>

interface CueOption {
  value: EatingCueDetail
  label: string
  icon: LucideIcon
  canonicalCue: EatingCue
}

const cueOptions: CueOption[] = [
  { value: 'PHYSICAL_HUNGER', label: 'Physical hunger', icon: Apple, canonicalCue: 'HUNGRY' },
  { value: 'CRAVINGS', label: 'Cravings', icon: Sparkles, canonicalCue: 'CRAVING' },
  { value: 'STRESS', label: 'Stress', icon: Brain, canonicalCue: 'JUST_BECAUSE' },
  { value: 'BOREDOM', label: 'Boredom', icon: Coffee, canonicalCue: 'JUST_BECAUSE' },
  { value: 'EMOTIONAL_EATING', label: 'Emotional eating', icon: Heart, canonicalCue: 'JUST_BECAUSE' },
  { value: 'SOCIAL_OCCASION', label: 'Social occasion', icon: Users, canonicalCue: 'JUST_BECAUSE' },
  { value: 'CONVENIENCE', label: 'Convenience', icon: Clock3, canonicalCue: 'JUST_BECAUSE' },
  { value: 'OTHER', label: 'Other', icon: CircleHelp, canonicalCue: 'JUST_BECAUSE' },
]

const hungerOptions: Array<{ value: HungerLevel; label: string }> = [
  { value: 1, label: 'Not hungry' },
  { value: 2, label: 'Slightly hungry' },
  { value: 3, label: 'Moderately hungry' },
  { value: 4, label: 'Very hungry' },
  { value: 5, label: 'Extremely hungry' },
]

const mealCategories: Array<{ value: MealCategory; label: string }> = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' },
]

const servingUnits = ['serving', 'bowl', 'cup', 'plate', 'piece', 'package', 'other']
const moods = ['Calm', 'Content', 'Happy', 'Neutral', 'Stressed', 'Low', 'Other']

function initialValues(): QuickLogValues {
  const now = new Date()
  return {
    foodName: '',
    mealType: '',
    date: getLocalDateKey(now),
    time: getLocalTimeKey(now),
    quantity: '1',
    servingUnit: 'serving',
    calories: '',
    eatingCue: '',
    hungerLevel: null,
    moodBefore: '',
    moodAfter: '',
    notes: '',
    context: '',
  }
}

function validate(values: QuickLogValues): QuickLogErrors {
  const errors: QuickLogErrors = {}
  if (!values.foodName.trim()) errors.foodName = 'Enter the food you ate.'
  if (!values.mealType) errors.mealType = 'Choose a meal category.'
  if (!values.date) errors.date = 'Choose the meal date.'
  if (!values.time) errors.time = 'Choose the meal time.'

  const quantity = Number(values.quantity)
  if (!values.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = 'Portion size must be greater than zero.'
  }
  if (!values.servingUnit) errors.servingUnit = 'Choose a serving unit.'
  if (values.calories.trim()) {
    const calories = Number(values.calories)
    if (!Number.isFinite(calories) || calories < 0) {
      errors.calories = 'Calories must be a number equal to or greater than zero.'
    }
  }
  if (!values.eatingCue) errors.eatingCue = 'Choose what influenced this meal.'
  if (!values.hungerLevel) errors.hungerLevel = 'Choose a hunger level.'
  return errors
}

const controlClassName = 'min-h-12 w-full rounded-tile border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent'

function QuickLog() {
  const navigate = useNavigate()
  const { addMeal } = useMealData()
  const [values, setValues] = useState<QuickLogValues>(initialValues)
  const [errors, setErrors] = useState<QuickLogErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const submittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  function update<K extends keyof QuickLogValues>(field: K, value: QuickLogValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormMessage('')
    setSuccessMessage('')
  }

  function resetForm() {
    setValues(initialValues())
    setErrors({})
    setFormMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setFormMessage('')
    setSuccessMessage('')
    const firstError = Object.keys(nextErrors)[0] as keyof QuickLogValues | undefined
    if (firstError) {
      setFormMessage('Please review the highlighted fields before saving.')
      const group = firstError === 'eatingCue' || firstError === 'hungerLevel'
      const target = group
        ? formRef.current?.querySelector<HTMLElement>(`[data-quick-log="${firstError}"]`)
        : formRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`)
      target?.focus()
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    try {
      const selectedCue = cueOptions.find((option) => option.value === values.eatingCue)
      if (!selectedCue || !values.mealType || !values.hungerLevel) {
        throw new Error('The quick log details were incomplete.')
      }
      await addMeal({
        foodName: values.foodName.trim(),
        mealType: values.mealType,
        logType: 'UNPLANNED',
        loggedAt: `${values.date}T${values.time}`,
        quantity: Number(values.quantity),
        servingUnit: values.servingUnit,
        ...(values.calories.trim() ? { calories: Number(values.calories) } : {}),
        foodArt: 'bowl',
        eatingCue: selectedCue.canonicalCue,
        eatingCueDetail: selectedCue.value,
        hungerLevel: values.hungerLevel,
        ...(values.moodBefore ? { moodBefore: values.moodBefore } : {}),
        ...(values.moodAfter ? { moodAfter: values.moodAfter } : {}),
        ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
        ...(values.context.trim() ? { context: values.context.trim() } : {}),
      })
      setSuccessMessage(`${values.foodName.trim()} was added to your Meal Log.`)
      setValues(initialValues())
      setErrors({})
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'We could not save this quick log. Please try again.')
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const selectedCueLabel = cueOptions.find((option) => option.value === values.eatingCue)?.label
  const caloriePreview = values.calories.trim() && Number.isFinite(Number(values.calories))
    ? Number(values.calories)
    : null

  return (
    <main className="min-w-0 space-y-7 sm:space-y-8">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-muted">A moment of awareness</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Quick Log</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Record an unplanned meal and understand what influenced your eating.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-panel">
          No judgment here. A few thoughtful details can help you notice patterns over time.
        </p>
      </header>

      {successMessage ? (
        <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-tile border border-line bg-accent-soft/70 p-4 text-sm text-ink">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div><p className="font-semibold">Quick Log saved</p><p className="mt-0.5">{successMessage}</p></div>
        </div>
      ) : null}
      {formMessage ? (
        <p role="alert" className="rounded-tile border border-accent bg-accent-soft/60 p-4 text-sm text-ink">{formMessage}</p>
      ) : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <form ref={formRef} noValidate onSubmit={handleSubmit} aria-busy={isSubmitting} className="min-w-0 space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-accent-soft text-ink"><Utensils aria-hidden="true" className="size-5" /></span>
              <div><h2 className="font-semibold text-ink">Food information</h2><p className="mt-1 text-sm text-muted">A few basics about what you ate.</p></div>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Input name="foodName" label="Food name" placeholder="e.g. Toast with avocado" value={values.foodName} onChange={(event) => update('foodName', event.target.value)} error={errors.foodName} variant="light" required className="min-w-0" />

              <label className="grid min-w-0 content-start gap-2 text-sm font-medium text-ink" htmlFor="quick-meal-category">
                <span>Meal category <span className="text-accent" aria-hidden="true">*</span></span>
                <select id="quick-meal-category" name="mealType" value={values.mealType} onChange={(event) => update('mealType', event.target.value as MealCategory | '')} aria-invalid={Boolean(errors.mealType)} aria-describedby={errors.mealType ? 'quick-meal-category-error' : undefined} className={`${controlClassName} ${errors.mealType ? 'border-accent' : ''}`}>
                  <option value="">Choose a category</option>
                  {mealCategories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
                {errors.mealType ? <span id="quick-meal-category-error" role="alert" className="text-xs font-normal text-panel">{errors.mealType}</span> : null}
              </label>

              <Input name="date" label="Meal date" type="date" value={values.date} onChange={(event) => update('date', event.target.value)} error={errors.date} variant="light" required className="min-w-0" />
              <Input name="time" label="Meal time" type="time" value={values.time} onChange={(event) => update('time', event.target.value)} error={errors.time} variant="light" required className="min-w-0" />
              <Input name="quantity" label="Portion size" type="number" min="0.1" step="0.1" value={values.quantity} onChange={(event) => update('quantity', event.target.value)} error={errors.quantity} variant="light" required className="min-w-0" />

              <label className="grid min-w-0 content-start gap-2 text-sm font-medium text-ink" htmlFor="quick-serving-unit">
                <span>Serving unit <span className="text-accent" aria-hidden="true">*</span></span>
                <select id="quick-serving-unit" name="servingUnit" value={values.servingUnit} onChange={(event) => update('servingUnit', event.target.value)} aria-invalid={Boolean(errors.servingUnit)} aria-describedby={errors.servingUnit ? 'quick-serving-unit-error' : undefined} className={`${controlClassName} ${errors.servingUnit ? 'border-accent' : ''}`}>
                  {servingUnits.map((unit) => <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>)}
                </select>
                {errors.servingUnit ? <span id="quick-serving-unit-error" role="alert" className="text-xs font-normal text-panel">{errors.servingUnit}</span> : null}
              </label>

              <Input name="calories" label="Calories (optional)" type="number" min="0" step="any" placeholder="Add if known" value={values.calories} onChange={(event) => update('calories', event.target.value)} error={errors.calories} variant="light" className="min-w-0" />
              <p className="self-end pb-1 text-xs leading-5 text-muted">Leave blank if you do not have a calorie estimate.</p>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <fieldset className="min-w-0" data-quick-log="eatingCue" tabIndex={-1} aria-invalid={Boolean(errors.eatingCue)} aria-describedby={errors.eatingCue ? 'quick-cue-error' : undefined}>
              <legend className="text-base font-semibold text-ink">What influenced your eating?</legend>
              <p className="mt-1 text-sm text-muted">Choose the cue that feels closest to this moment.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {cueOptions.map(({ icon, label, value }) => (
                  <Chip key={value} selected={values.eatingCue === value} icon={icon} className="min-h-12 w-full justify-start rounded-tile px-3 text-left text-xs sm:text-sm" aria-label={label} onClick={() => update('eatingCue', value)}>
                    {label}
                  </Chip>
                ))}
              </div>
              {errors.eatingCue ? <p id="quick-cue-error" role="alert" className="mt-2 text-sm text-panel">{errors.eatingCue}</p> : null}
            </fieldset>
          </Card>

          <Card className="p-5 sm:p-6">
            <fieldset className="min-w-0" data-quick-log="hungerLevel" tabIndex={-1} aria-invalid={Boolean(errors.hungerLevel)} aria-describedby={errors.hungerLevel ? 'quick-hunger-error' : undefined}>
              <legend className="text-base font-semibold text-ink">How hungry did you feel?</legend>
              <p className="mt-1 text-sm text-muted">Use your own sense of hunger; there is no right answer.</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {hungerOptions.map(({ label, value }) => (
                  <button key={value} type="button" aria-pressed={values.hungerLevel === value} aria-label={`${value}: ${label}`} onClick={() => update('hungerLevel', value)} className={`flex min-h-[5.5rem] min-w-0 flex-col items-center justify-center gap-2 rounded-tile border px-1.5 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${values.hungerLevel === value ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-muted hover:bg-cream'}`}>
                    <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${values.hungerLevel === value ? 'bg-accent text-ink' : 'bg-cream text-ink'}`}>{value}</span>
                    <span className="text-[10px] font-medium leading-tight sm:text-xs">{label}</span>
                  </button>
                ))}
              </div>
              {errors.hungerLevel ? <p id="quick-hunger-error" role="alert" className="mt-2 text-sm text-panel">{errors.hungerLevel}</p> : null}
            </fieldset>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-cream text-panel"><Heart aria-hidden="true" className="size-5" /></span>
              <div><h2 className="font-semibold text-ink">A little more context</h2><p className="mt-1 text-sm text-muted">Optional details can help you reflect later.</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid content-start gap-2 text-sm font-medium text-ink" htmlFor="mood-before">Mood before eating <span className="font-normal text-muted">(optional)</span>
                <select id="mood-before" name="moodBefore" value={values.moodBefore} onChange={(event) => update('moodBefore', event.target.value)} className={controlClassName}>
                  <option value="">Choose a mood</option>{moods.map((mood) => <option key={mood} value={mood.toUpperCase()}>{mood}</option>)}
                </select>
              </label>
              <label className="grid content-start gap-2 text-sm font-medium text-ink" htmlFor="mood-after">Mood after eating <span className="font-normal text-muted">(optional)</span>
                <select id="mood-after" name="moodAfter" value={values.moodAfter} onChange={(event) => update('moodAfter', event.target.value)} className={controlClassName}>
                  <option value="">Choose a mood</option>{moods.map((mood) => <option key={mood} value={mood.toUpperCase()}>{mood}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink sm:col-span-2" htmlFor="quick-log-notes">Notes <span className="font-normal text-muted">(optional)</span>
                <textarea id="quick-log-notes" name="notes" rows={3} value={values.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Anything you would like to remember?" className="w-full resize-y rounded-tile border border-line bg-surface px-3 py-3 text-sm font-normal text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink sm:col-span-2" htmlFor="quick-log-context">Additional context <span className="font-normal text-muted">(optional)</span>
                <textarea id="quick-log-context" name="context" rows={3} value={values.context} onChange={(event) => update('context', event.target.value)} placeholder="For example, where you were or what was happening" className="w-full resize-y rounded-tile border border-line bg-surface px-3 py-3 text-sm font-normal text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent" />
              </label>
            </div>
          </Card>

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="light" icon={ArrowLeft} disabled={isSubmitting} onClick={() => navigate('/meals')}>Cancel</Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button variant="sand" icon={RotateCcw} disabled={isSubmitting} onClick={resetForm}>Reset form</Button>
              <Button type="submit" variant="accent" icon={Zap} loading={isSubmitting} disabled={isSubmitting} className="min-h-12 px-6">Save Quick Log</Button>
            </div>
          </div>
        </form>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start" aria-label="Quick Log summary">
          <Card className="overflow-hidden p-0">
            <div className="bg-cream px-5 pb-2 pt-5">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="unplanned">Unplanned meal</Badge>
                <span className="text-xs text-muted">A private reflection</span>
              </div>
              <div className="mx-auto mt-3 grid h-32 w-40 place-items-center">
                <FoodArt variant="bowl" bowlVariant="rainbow" title="Illustrative meal bowl" className="size-full" />
              </div>
            </div>
            <div className="p-5">
              <h2 className="font-semibold text-ink">Your entry at a glance</h2>
              <p className="mt-1 text-sm text-muted">{values.foodName.trim() || 'Your food will appear here'}</p>
              <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
                <div className="flex items-center justify-between gap-3"><span className="text-muted">Eating cue</span><span className="text-right font-medium text-ink">{selectedCueLabel ?? 'Choose a cue'}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-muted">Hunger level</span><span className="text-right font-medium text-ink">{values.hungerLevel ? `${values.hungerLevel} / 5` : 'Choose a level'}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-muted">Calories</span><span className="text-right font-medium text-ink">{caloriePreview === null ? 'Not provided' : `${caloriePreview} kcal`}</span></div>
              </div>
            </div>
          </Card>
          <Card className="flex gap-3 border border-line bg-cream/70 p-4 shadow-none">
            <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-panel" />
            <p className="text-xs leading-5 text-muted">Your quick log will appear in Meal Log. Nutrition values you record will be included in the saved daily summary.</p>
          </Card>
          <p className="flex items-start gap-2 px-1 text-[11px] leading-5 text-muted"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" /><span>Patterns are associations, not causes. This experience is not medical advice.</span></p>
        </aside>
      </div>
    </main>
  )
}

export default QuickLog
