import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button, Input } from '../ui'
import { cn } from '../ui/styles'
import type { MealCategory, MealEntry, MealFormErrors, MealFormValues } from '../../types/meal'
import { getLocalDateKey, getLocalTimeKey } from '../../lib/date'

const categories: Array<{ value: MealCategory; label: string }> = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snacks' },
]

function valuesFromMeal(meal?: MealEntry, selectedDate = getLocalDateKey()): MealFormValues {
  return {
    foodName: meal?.foodName ?? '',
    mealType: meal?.mealType ?? '',
    date: meal ? getLocalDateKey(new Date(meal.loggedAt)) : selectedDate,
    time: meal ? getLocalTimeKey(new Date(meal.loggedAt)) : '12:00',
    quantity: String(meal?.quantity ?? 1),
    servingUnit: meal?.servingUnit ?? 'serving',
    calories: String(meal?.calories ?? ''),
    proteinG: String(meal?.proteinG ?? ''),
    carbsG: String(meal?.carbsG ?? ''),
    fatG: String(meal?.fatG ?? ''),
    notes: meal?.notes ?? '',
  }
}

function validate(values: MealFormValues, allowMissingNutrition = false): MealFormErrors {
  const errors: MealFormErrors = {}
  if (!values.foodName.trim()) errors.foodName = 'Enter a food or meal name.'
  if (!values.mealType) errors.mealType = 'Choose a meal category.'
  if (!values.date) errors.date = 'Choose a date.'
  if (!values.time) errors.time = 'Choose a time.'
  if (!values.servingUnit.trim()) errors.servingUnit = 'Enter a serving unit.'

  const quantity = Number(values.quantity)
  if (!values.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = 'Quantity must be greater than zero.'
  }

  const numericFields: Array<keyof Pick<MealFormValues, 'calories' | 'proteinG' | 'carbsG' | 'fatG'>> = [
    'calories', 'proteinG', 'carbsG', 'fatG',
  ]
  for (const field of numericFields) {
    const value = values[field].trim()
    const number = Number(value)
    if (!value && allowMissingNutrition) continue
    if (!value || !Number.isFinite(number) || number < 0) {
      const label = field === 'proteinG' ? 'Protein' : field === 'carbsG' ? 'Carbohydrates' : field === 'fatG' ? 'Fat' : 'Calories'
      errors[field] = `${label} must be a number equal to or greater than zero.`
    }
  }
  return errors
}

interface MealFormDialogProps {
  meal?: MealEntry
  selectedDate: string
  onCancel: () => void
  onSave: (meal: MealEntry) => Promise<void> | void
  isSaving?: boolean
  saveError?: string
}

export function MealFormDialog({ meal, selectedDate, onCancel, onSave, isSaving = false, saveError }: MealFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [values, setValues] = useState(() => valuesFromMeal(meal, selectedDate))
  const [errors, setErrors] = useState<MealFormErrors>({})

  useEffect(() => {
    setValues(valuesFromMeal(meal, selectedDate))
    setErrors({})
  }, [meal, selectedDate])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    dialog?.querySelector<HTMLInputElement>('[name="foodName"]')?.focus()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function update<K extends keyof MealFormValues>(field: K, value: MealFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values, true)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.keys(nextErrors)[0]
      dialogRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus()
      return
    }

    const loggedAt = `${values.date}T${values.time}`
    onSave({
      ...meal,
      mealId: meal?.mealId ?? '',
      foodName: values.foodName.trim(),
      mealType: values.mealType as MealCategory,
      logType: meal?.logType ?? 'REGULAR',
      loggedAt,
      quantity: Number(values.quantity),
      servingUnit: values.servingUnit.trim(),
      calories: values.calories.trim() ? Number(values.calories) : undefined,
      proteinG: values.proteinG.trim() ? Number(values.proteinG) : undefined,
      carbsG: values.carbsG.trim() ? Number(values.carbsG) : undefined,
      fatG: values.fatG.trim() ? Number(values.fatG) : undefined,
      notes: values.notes.trim() || undefined,
      foodArt: meal?.foodArt ?? 'bowl',
    })
  }

  const selectClassName = 'min-h-12 w-full rounded-tile border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="meal-dialog-title"
      aria-describedby="meal-dialog-description"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,44rem)] overflow-y-auto rounded-card border-0 bg-screen p-0 text-ink shadow-phone backdrop:bg-panel/60"
      onCancel={(event) => { event.preventDefault(); onCancel() }}
      onClick={(event) => { if (event.target === event.currentTarget) onCancel() }}
    >
      <div className="p-5 sm:p-7" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Meal journal</p>
            <h2 id="meal-dialog-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
              {meal ? 'Edit meal' : 'Add a meal'}
            </h2>
            <p id="meal-dialog-description" className="mt-1 text-sm text-muted">
              Add the meal details you would like to keep in your journal.
            </p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close meal form" className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-cream hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">×</button>
        </div>

        <form className="grid gap-5" noValidate onSubmit={(event) => { event.preventDefault(); if (!isSaving) submit(event) }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="foodName" label="Food name" placeholder="e.g. Harvest grain bowl" value={values.foodName} onChange={(event) => update('foodName', event.target.value)} error={errors.foodName} variant="light" autoFocus />
            <div className="grid content-start gap-2">
              <label htmlFor="meal-category" className="text-sm font-medium text-ink">Meal category</label>
              <select id="meal-category" name="mealType" className={cn(selectClassName, errors.mealType && 'border-accent')} value={values.mealType} onChange={(event) => update('mealType', event.target.value as MealCategory | '')} aria-invalid={Boolean(errors.mealType)} aria-describedby={errors.mealType ? 'meal-category-error' : undefined}>
                <option value="">Choose a category</option>
                {categories.map((category) => <option value={category.value} key={category.value}>{category.label}</option>)}
              </select>
              {errors.mealType ? <p id="meal-category-error" role="alert" className="text-sm text-panel">{errors.mealType}</p> : null}
            </div>
            <Input name="date" label="Date" type="date" value={values.date} onChange={(event) => update('date', event.target.value)} error={errors.date} variant="light" />
            <Input name="time" label="Time" type="time" value={values.time} onChange={(event) => update('time', event.target.value)} error={errors.time} variant="light" />
            <Input name="quantity" label="Quantity" type="number" min="0.01" step="any" value={values.quantity} onChange={(event) => update('quantity', event.target.value)} error={errors.quantity} variant="light" />
            <Input name="servingUnit" label="Serving unit" placeholder="e.g. bowl, cup, plate" value={values.servingUnit} onChange={(event) => update('servingUnit', event.target.value)} error={errors.servingUnit} variant="light" />
          </div>

          <fieldset className="grid w-full min-w-0 gap-3">
            <legend className="mb-1 block w-full text-sm font-semibold text-ink">Nutrition · optional</legend>
            <div className="grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-4">
              <Input className="min-w-0 grid-cols-[minmax(0,1fr)]" name="calories" label="Calories (kcal)" type="number" min="0" step="any" value={values.calories} onChange={(event) => update('calories', event.target.value)} error={errors.calories} variant="light" />
              <Input className="min-w-0 grid-cols-[minmax(0,1fr)]" name="proteinG" label="Protein (g)" type="number" min="0" step="any" value={values.proteinG} onChange={(event) => update('proteinG', event.target.value)} error={errors.proteinG} variant="light" />
              <Input className="min-w-0 grid-cols-[minmax(0,1fr)]" name="carbsG" label="Carbs (g)" type="number" min="0" step="any" value={values.carbsG} onChange={(event) => update('carbsG', event.target.value)} error={errors.carbsG} variant="light" />
              <Input className="min-w-0 grid-cols-[minmax(0,1fr)]" name="fatG" label="Fat (g)" type="number" min="0" step="any" value={values.fatG} onChange={(event) => update('fatG', event.target.value)} error={errors.fatG} variant="light" />
            </div>
          </fieldset>

          <label className="grid gap-2 text-sm font-medium text-ink" htmlFor="meal-notes">
            Notes <span className="font-normal text-muted">(optional)</span>
            <textarea id="meal-notes" name="notes" rows={3} value={values.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Add a note about this meal" className="w-full resize-y rounded-tile border border-line bg-surface px-3 py-3 text-sm font-normal text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent" />
          </label>

          {saveError ? <p role="alert" className="rounded-tile border border-accent bg-accent-soft/60 p-3 text-sm text-ink">{saveError}</p> : null}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button variant="light" disabled={isSaving} onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="dark" loading={isSaving}>{meal ? 'Save changes' : 'Save meal'}</Button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
