import { getLocalDateKey, shiftDateKey } from './date'
import type { EatingCue, EatingCueDetail, HungerLevel, MealCategory, MealEntry } from '../types/meal'

export type PatternRange = 7 | 30 | 90

export const eatingCueOptions: Array<{ value: EatingCueDetail; label: string }> = [
  { value: 'PHYSICAL_HUNGER', label: 'Physical hunger' },
  { value: 'CRAVINGS', label: 'Cravings' },
  { value: 'STRESS', label: 'Stress' },
  { value: 'BOREDOM', label: 'Boredom' },
  { value: 'EMOTIONAL_EATING', label: 'Emotional eating' },
  { value: 'SOCIAL_OCCASION', label: 'Social occasion' },
  { value: 'CONVENIENCE', label: 'Convenience' },
  { value: 'OTHER', label: 'Other' },
]

export const hungerLevelOptions: Array<{ value: HungerLevel; label: string }> = [
  { value: 1, label: 'Not hungry' },
  { value: 2, label: 'Slightly hungry' },
  { value: 3, label: 'Moderately hungry' },
  { value: 4, label: 'Very hungry' },
  { value: 5, label: 'Extremely hungry' },
]

export const mealCategoryOptions: Array<{ value: MealCategory; label: string }> = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snacks' },
]

const daypartOptions = [
  { value: 'Overnight', start: 0, end: 5 },
  { value: 'Morning', start: 5, end: 11 },
  { value: 'Midday', start: 11, end: 15 },
  { value: 'Afternoon', start: 15, end: 18 },
  { value: 'Evening', start: 18, end: 22 },
  { value: 'Late night', start: 22, end: 24 },
] as const

export interface CountItem {
  key: string
  label: string
  count: number
  percentage: number
}

export interface DailyPatternPoint {
  dateKey: string
  label: string
  mealCount: number
  regularCount: number
  unplannedCount: number
  cueCount: number
  averageHunger: number | null
}

export interface PatternAnalytics {
  range: PatternRange
  startDate: string
  endDate: string
  previousStartDate: string
  previousEndDate: string
  meals: MealEntry[]
  mealCount: number
  previousMealCount: number
  unplannedCount: number
  previousUnplannedCount: number
  cueTaggedCount: number
  previousCueTaggedCount: number
  skippedInvalidDates: number
  duplicateCount: number
  cueDistribution: CountItem[]
  hungerDistribution: CountItem[]
  hungerCount: number
  averageHunger: number | null
  mostCommonHunger: string | null
  dailyHungerRange: { first: number | null; last: number | null; change: number | null }
  mealCategoryDistribution: CountItem[]
  unplannedCategoryDistribution: CountItem[]
  daypartDistribution: CountItem[]
  unplannedDaypartDistribution: CountItem[]
  commonHours: Array<{ hour: number; label: string; count: number }>
  moodBeforeDistribution: CountItem[]
  moodAfterDistribution: CountItem[]
  moodTransitionCount: number
  moodSameCount: number
  moodDifferentCount: number
  cueMoodAssociations: Array<{ cue: EatingCueDetail; cueLabel: string; mood: string; count: number }>
  dailyTrend: DailyPatternPoint[]
}

function validDateKey(dateKey: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day, 12)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function validTimestamp(value: string): Date | null {
  if (typeof value !== 'string' || value.length < 10) return null
  const dateKey = value.slice(0, 10)
  if (!validDateKey(dateKey)) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateKeyFor(timestamp: Date): string {
  return getLocalDateKey(timestamp)
}

function resolveCue(meal: MealEntry): EatingCueDetail | null {
  if (meal.eatingCueDetail) return meal.eatingCueDetail
  const legacyCue: Record<EatingCue, EatingCueDetail> = {
    HUNGRY: 'PHYSICAL_HUNGER',
    CRAVING: 'CRAVINGS',
    OVERATE: 'OTHER',
    JUST_BECAUSE: 'OTHER',
  }
  return meal.eatingCue ? legacyCue[meal.eatingCue] : null
}

function readableValue(value: string): string {
  return value
    .trim()
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getDaypart(hour: number): string {
  return daypartOptions.find((part) => hour >= part.start && hour < part.end)?.value ?? 'Late night'
}

function getCountDistribution<T>(
  items: readonly T[],
  getKey: (item: T) => string | null,
  labelForKey: (key: string) => string,
  fixedKeys?: readonly string[],
): CountItem[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    const key = getKey(item)
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const keys = fixedKeys ? [...fixedKeys] : [...counts.keys()].sort((a, b) => a.localeCompare(b))
  const denominator = items.filter((item) => getKey(item) !== null).length
  return keys.map((key) => ({
    key,
    label: labelForKey(key),
    count: counts.get(key) ?? 0,
    percentage: denominator > 0 ? Math.round(((counts.get(key) ?? 0) / denominator) * 100) : 0,
  }))
}

function deduplicateMeals(meals: readonly MealEntry[]): { valid: Array<{ meal: MealEntry; date: Date }>; skippedInvalidDates: number; duplicateCount: number } {
  const unique = new Map<string, { meal: MealEntry; date: Date }>()
  let skippedInvalidDates = 0
  let duplicateCount = 0

  for (const meal of meals) {
    const date = validTimestamp(meal.loggedAt)
    if (!date) {
      skippedInvalidDates += 1
      continue
    }
    if (unique.has(meal.mealId)) duplicateCount += 1
    const existing = unique.get(meal.mealId)
    if (!existing || date.getTime() >= existing.date.getTime()) unique.set(meal.mealId, { meal, date })
  }
  return { valid: [...unique.values()], skippedInvalidDates, duplicateCount }
}

function countCue(meal: MealEntry): boolean {
  return resolveCue(meal) !== null
}

export function calculatePatternAnalytics(
  sourceMeals: readonly MealEntry[],
  range: PatternRange,
  todayDate = new Date(),
): PatternAnalytics {
  const today = getLocalDateKey(todayDate)
  const startDate = shiftDateKey(today, -(range - 1))
  const previousEndDate = shiftDateKey(today, -range)
  const previousStartDate = shiftDateKey(previousEndDate, -(range - 1))
  const { valid, skippedInvalidDates, duplicateCount } = deduplicateMeals(sourceMeals)
  const currentWithDates = valid.filter(({ date }) => {
    const key = dateKeyFor(date)
    return key >= startDate && key <= today
  })
  const previousMeals = valid.filter(({ date }) => {
    const key = dateKeyFor(date)
    return key >= previousStartDate && key <= previousEndDate
  })
  const meals = currentWithDates.map(({ meal }) => meal)
  const cueTaggedCount = meals.filter(countCue).length
  const previousCueTaggedCount = previousMeals.filter(({ meal }) => countCue(meal)).length
  const unplannedCount = meals.filter((meal) => meal.logType === 'UNPLANNED').length
  const previousUnplannedCount = previousMeals.filter(({ meal }) => meal.logType === 'UNPLANNED').length

  const cueDistribution = getCountDistribution(
    meals,
    (meal) => resolveCue(meal),
    (key) => eatingCueOptions.find((cue) => cue.value === key)?.label ?? readableValue(key),
    eatingCueOptions.map((cue) => cue.value),
  )
  const hungerDistribution = getCountDistribution(
    meals.filter((meal) => meal.hungerLevel !== undefined && meal.hungerLevel >= 1 && meal.hungerLevel <= 5),
    (meal) => String(meal.hungerLevel),
    (key) => hungerLevelOptions.find((level) => String(level.value) === key)?.label ?? key,
    hungerLevelOptions.map((level) => String(level.value)),
  )
  const hungerMeals = meals.filter((meal) => meal.hungerLevel !== undefined && meal.hungerLevel >= 1 && meal.hungerLevel <= 5)
  const hungerCount = hungerMeals.length
  const averageHunger = hungerCount ? hungerMeals.reduce((sum, meal) => sum + (meal.hungerLevel ?? 0), 0) / hungerCount : null
  const maxHungerCount = Math.max(0, ...hungerDistribution.map((item) => item.count))
  const topHungerLevels = hungerDistribution.filter((item) => item.count > 0 && item.count === maxHungerCount)
  const mostCommonHunger = topHungerLevels.length === 1 ? topHungerLevels[0].label : null

  const mealCategoryDistribution = getCountDistribution(
    meals,
    (meal) => meal.mealType,
    (key) => mealCategoryOptions.find((category) => category.value === key)?.label ?? readableValue(key),
    mealCategoryOptions.map((category) => category.value),
  )
  const unplannedMeals = meals.filter((meal) => meal.logType === 'UNPLANNED')
  const unplannedCategoryDistribution = getCountDistribution(
    unplannedMeals,
    (meal) => meal.mealType,
    (key) => mealCategoryOptions.find((category) => category.value === key)?.label ?? readableValue(key),
    mealCategoryOptions.map((category) => category.value),
  )

  const datedMeals = currentWithDates.map(({ meal, date }) => ({ meal, date }))
  const daypartDistribution = getCountDistribution(
    datedMeals,
    ({ date }) => getDaypart(date.getHours()),
    (key) => key,
    daypartOptions.map((part) => part.value),
  )
  const unplannedDatedMeals = datedMeals.filter(({ meal }) => meal.logType === 'UNPLANNED')
  const unplannedDaypartDistribution = getCountDistribution(
    unplannedDatedMeals,
    ({ date }) => getDaypart(date.getHours()),
    (key) => key,
    daypartOptions.map((part) => part.value),
  )
  const hourCounts = new Map<number, number>()
  for (const { date } of datedMeals) hourCounts.set(date.getHours(), (hourCounts.get(date.getHours()) ?? 0) + 1)
  const commonHours = [...hourCounts.entries()]
    .map(([hour, count]) => ({ hour, count, label: new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(new Date(2020, 0, 1, hour)) }))
    .sort((a, b) => b.count - a.count || a.hour - b.hour)
    .slice(0, 5)

  const moodBeforeMeals = meals.filter((meal) => meal.moodBefore?.trim())
  const moodAfterMeals = meals.filter((meal) => meal.moodAfter?.trim())
  const moodBeforeDistribution = getCountDistribution(moodBeforeMeals, (meal) => meal.moodBefore?.trim().toLowerCase() ?? null, readableValue)
  const moodAfterDistribution = getCountDistribution(moodAfterMeals, (meal) => meal.moodAfter?.trim().toLowerCase() ?? null, readableValue)
  const pairedMoods = meals.filter((meal) => meal.moodBefore?.trim() && meal.moodAfter?.trim())
  const moodSameCount = pairedMoods.filter((meal) => meal.moodBefore?.trim().toLowerCase() === meal.moodAfter?.trim().toLowerCase()).length
  const moodDifferentCount = pairedMoods.length - moodSameCount
  const associationCounts = new Map<string, { cue: EatingCueDetail; mood: string; count: number }>()
  for (const meal of meals) {
    const cue = resolveCue(meal)
    const mood = meal.moodBefore?.trim()
    if (!cue || !mood) continue
    const key = `${cue}:${mood.toLowerCase()}`
    const current = associationCounts.get(key)
    associationCounts.set(key, { cue, mood: readableValue(mood.toLowerCase()), count: (current?.count ?? 0) + 1 })
  }
  const cueMoodAssociations = [...associationCounts.values()]
    .map((item) => ({ ...item, cueLabel: eatingCueOptions.find((cue) => cue.value === item.cue)?.label ?? readableValue(item.cue) }))
    .sort((a, b) => b.count - a.count || a.cueLabel.localeCompare(b.cueLabel))
    .slice(0, 8)

  const dailyTrend: DailyPatternPoint[] = Array.from({ length: range }, (_, index) => {
    const dateKey = shiftDateKey(startDate, index)
    const dayEntries = currentWithDates.filter(({ date }) => dateKeyFor(date) === dateKey)
    const dayHunger = dayEntries.map(({ meal }) => meal.hungerLevel).filter((level): level is HungerLevel => level !== undefined && level >= 1 && level <= 5)
    const date = new Date(`${dateKey}T12:00:00`)
    return {
      dateKey,
      label: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date),
      mealCount: dayEntries.length,
      regularCount: dayEntries.filter(({ meal }) => meal.logType === 'REGULAR').length,
      unplannedCount: dayEntries.filter(({ meal }) => meal.logType === 'UNPLANNED').length,
      cueCount: dayEntries.filter(({ meal }) => countCue(meal)).length,
      averageHunger: dayHunger.length ? dayHunger.reduce((sum, level) => sum + level, 0) / dayHunger.length : null,
    }
  })
  const hungerPoints = dailyTrend.filter((point) => point.averageHunger !== null)
  const firstDailyHunger = hungerPoints[0]?.averageHunger ?? null
  const lastDailyHunger = hungerPoints[hungerPoints.length - 1]?.averageHunger ?? null

  return {
    range,
    startDate,
    endDate: today,
    previousStartDate,
    previousEndDate,
    meals,
    mealCount: meals.length,
    previousMealCount: previousMeals.length,
    unplannedCount,
    previousUnplannedCount,
    cueTaggedCount,
    previousCueTaggedCount,
    skippedInvalidDates,
    duplicateCount,
    cueDistribution,
    hungerDistribution,
    hungerCount,
    averageHunger,
    mostCommonHunger,
    dailyHungerRange: {
      first: firstDailyHunger,
      last: lastDailyHunger,
      change: firstDailyHunger !== null && lastDailyHunger !== null ? lastDailyHunger - firstDailyHunger : null,
    },
    mealCategoryDistribution,
    unplannedCategoryDistribution,
    daypartDistribution,
    unplannedDaypartDistribution,
    commonHours,
    moodBeforeDistribution,
    moodAfterDistribution,
    moodTransitionCount: pairedMoods.length,
    moodSameCount,
    moodDifferentCount,
    cueMoodAssociations,
    dailyTrend,
  }
}

export interface PatternInsight {
  title: string
  description: string
}

type PatternInsightSource = Pick<PatternAnalytics,
  | 'mealCount'
  | 'cueTaggedCount'
  | 'cueDistribution'
  | 'daypartDistribution'
  | 'hungerCount'
  | 'mostCommonHunger'
  | 'hungerDistribution'
  | 'unplannedCount'
  | 'unplannedDaypartDistribution'
  | 'moodTransitionCount'
  | 'moodSameCount'
  | 'moodDifferentCount'
  | 'moodBeforeDistribution'
  | 'moodAfterDistribution'
>

function uniqueTop(distribution: CountItem[]): CountItem | null {
  const nonZero = distribution.filter((item) => item.count > 0)
  if (!nonZero.length) return null
  const max = Math.max(...nonZero.map((item) => item.count))
  const top = nonZero.filter((item) => item.count === max)
  return top.length === 1 ? top[0] : null
}

export function generatePatternInsights(analytics: PatternInsightSource): PatternInsight[] {
  if (!analytics.mealCount) {
    return [{ title: 'A fresh start', description: 'Log a few meals to begin seeing your personal eating patterns here.' }]
  }

  const insights: PatternInsight[] = []
  if (analytics.cueTaggedCount >= 3) {
    const topCue = uniqueTop(analytics.cueDistribution)
    if (topCue) insights.push({ title: 'Eating cues', description: `${topCue.label} was recorded more often than other cues in this period (${topCue.count} of ${analytics.cueTaggedCount} cue-tagged entries).` })
    else insights.push({ title: 'Eating cues', description: `Your cue-tagged entries are spread across multiple cues. ${analytics.cueTaggedCount} entries include a recorded cue.` })
  } else {
    insights.push({ title: 'Eating cues', description: 'A few more cue-tagged entries will help reveal which eating cues appear most often.' })
  }

  if (analytics.mealCount >= 3) {
    const topTime = uniqueTop(analytics.daypartDistribution)
    if (topTime) insights.push({ title: 'Meal timing', description: `Most recorded meals occurred during ${topTime.label.toLowerCase()} (${topTime.count} of ${analytics.mealCount} entries).` })
    else insights.push({ title: 'Meal timing', description: 'Your recorded meals are spread across more than one time of day.' })
  } else {
    insights.push({ title: 'Meal timing', description: 'More meal entries will help show when you tend to eat most often.' })
  }

  if (analytics.hungerCount >= 3) {
    if (analytics.mostCommonHunger) insights.push({ title: 'Hunger check-ins', description: `Your most frequently recorded hunger level was ${analytics.mostCommonHunger.toLowerCase()} (${Math.max(...analytics.hungerDistribution.map((item) => item.count))} entries).` })
    else insights.push({ title: 'Hunger check-ins', description: 'Your recorded hunger levels are tied across multiple levels.' })
  } else {
    insights.push({ title: 'Hunger check-ins', description: 'Record hunger levels a few more times to see which levels are most common.' })
  }

  if (analytics.unplannedCount >= 3) {
    const topUnplannedTime = uniqueTop(analytics.unplannedDaypartDistribution)
    if (topUnplannedTime) insights.push({ title: 'Unplanned meals', description: `Unplanned entries appeared most often during ${topUnplannedTime.label.toLowerCase()} (${topUnplannedTime.count} of ${analytics.unplannedCount}).` })
    else insights.push({ title: 'Unplanned meals', description: 'Your unplanned entries are spread across multiple times of day.' })
  } else {
    insights.push({ title: 'Unplanned meals', description: 'More unplanned entries will help reveal when they tend to appear in your day.' })
  }

  if (analytics.moodTransitionCount >= 3) {
    insights.push({ title: 'Mood notes', description: `You recorded both before and after moods for ${analytics.moodTransitionCount} entries. ${analytics.moodSameCount} pairs used the same mood label and ${analytics.moodDifferentCount} used different labels; these are observed associations only.` })
  } else if (analytics.moodBeforeDistribution.length || analytics.moodAfterDistribution.length) {
    insights.push({ title: 'Mood notes', description: 'A few more entries with both mood fields can help summarize recorded mood pairs.' })
  }
  return insights.slice(0, 5)
}
