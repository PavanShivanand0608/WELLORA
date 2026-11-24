import mongoose, { type PipelineStage } from 'mongoose'
import { Meal, UserSettings } from '../models/index.js'
import type { MealListQuery } from '../validators/meal.js'
import type { RangeAnalyticsQuery } from '../validators/analytics.js'
import { listMealsForUser } from './mealService.js'
import { summarizeMealsForUser } from './nutritionService.js'

const DAY_MS = 86_400_000
const nutritionFields = [
  { field: 'calories', total: 'caloriesTotal', count: 'caloriesRecordedCount' },
  { field: 'proteinG', total: 'proteinGTotal', count: 'proteinGRecordedCount' },
  { field: 'carbsG', total: 'carbsGTotal', count: 'carbsGRecordedCount' },
  { field: 'fatG', total: 'fatGTotal', count: 'fatGRecordedCount' },
] as const

function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year!, month! - 1, day! + days)).toISOString().slice(0, 10)
}

function dateKeyInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function startOfDateInTimezone(dateKey: string, timezone: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const target = Date.UTC(year!, month! - 1, day!)
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  let guess = target
  for (let iteration = 0; iteration < 4; iteration += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]))
    const rendered = Date.UTC(
      Number(parts.year), Number(parts.month) - 1, Number(parts.day),
      Number(parts.hour), Number(parts.minute), Number(parts.second),
    )
    const adjustment = target - rendered
    if (adjustment === 0) break
    guess += adjustment
  }
  return new Date(guess)
}

function configuredGoals(settings: { goals?: Record<string, unknown> } | null) {
  const source = settings?.goals ?? {}
  const goals: Record<string, number> = {}
  for (const field of ['calories', 'proteinG', 'carbsG', 'fatG'] as const) {
    const value = source[field]
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) goals[field] = value
  }
  return goals
}

function nutritionJoinStages(): PipelineStage[] {
  return [
    { $lookup: {
      from: 'nutritions',
      let: { mealId: '$_id', ownerId: '$userId' },
      pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$mealId', '$$mealId'] }, { $eq: ['$userId', '$$ownerId'] }] } } }],
      as: 'nutrition',
    } },
    { $unwind: { path: '$nutrition', preserveNullAndEmptyArrays: true } },
  ]
}

export async function getDashboardAnalytics(userId: string, dateKey: string, timezone: string) {
  const start = startOfDateInTimezone(dateKey, timezone)
  const endExclusive = startOfDateInTimezone(shiftDateKey(dateKey, 1), timezone)
  const bounds = { startDate: start.toISOString(), endDate: new Date(endExclusive.getTime() - 1).toISOString() }
  const listQuery: MealListQuery = { ...bounds, page: 1, limit: 100, sort: 'desc' }
  const [summary, list] = await Promise.all([
    summarizeMealsForUser(userId, bounds),
    listMealsForUser(userId, listQuery),
  ])
  const remaining = {
    calories: summary.goals.calories != null && summary.calories.total != null ? Math.max(summary.goals.calories - summary.calories.total, 0) : null,
    proteinG: summary.goals.proteinG != null && summary.proteinG.total != null ? Math.max(summary.goals.proteinG - summary.proteinG.total, 0) : null,
    carbsG: summary.goals.carbsG != null && summary.carbsG.total != null ? Math.max(summary.goals.carbsG - summary.carbsG.total, 0) : null,
    fatG: summary.goals.fatG != null && summary.fatG.total != null ? Math.max(summary.goals.fatG - summary.fatG.total, 0) : null,
  }
  return {
    date: dateKey,
    timezone,
    summary: { ...summary, remaining },
    meals: list.meals,
    mealListPagination: list.pagination,
  }
}

interface NormalizedRange {
  startDate: string
  endDate: string
  timezone: string
  range: number
}

function resolveRange(query: RangeAnalyticsQuery): NormalizedRange {
  const timezone = query.timezone
  const endDate = query.endDate ?? dateKeyInTimezone(new Date(), timezone)
  const range = query.range
    ? Number(query.range)
    : query.startDate && query.endDate
      ? Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${query.startDate}T00:00:00Z`)) / DAY_MS) + 1
      : 7
  const startDate = query.startDate ?? shiftDateKey(endDate, 1 - range)
  return { startDate, endDate, timezone, range }
}

function nutritionGroupStages(): PipelineStage[] {
  const group: Record<string, unknown> = {
    _id: '$day',
    mealCount: { $sum: 1 },
  }
  for (const { field, total, count } of nutritionFields) {
    group[total] = { $sum: { $cond: [{ $isNumber: `$nutrition.${field}` }, `$nutrition.${field}`, 0] } }
    group[count] = { $sum: { $cond: [{ $isNumber: `$nutrition.${field}` }, 1, 0] } }
  }
  return [{ $group: group as PipelineStage.Group['$group'] }, { $sort: { _id: 1 } }]
}

function dailyNumber(total: unknown, count: unknown) {
  return typeof count === 'number' && count > 0 && typeof total === 'number' ? total : null
}

export async function getNutritionTrends(userId: string, query: RangeAnalyticsQuery) {
  const period = resolveRange(query)
  const start = startOfDateInTimezone(period.startDate, period.timezone)
  const endExclusive = startOfDateInTimezone(shiftDateKey(period.endDate, 1), period.timezone)
  const match = { userId: new mongoose.Types.ObjectId(userId), loggedAt: { $gte: start, $lt: endExclusive } }
  const [aggregates, settings] = await Promise.all([
    Meal.aggregate([
      { $match: match },
      ...nutritionJoinStages(),
      { $set: { day: { $dateTrunc: { date: '$loggedAt', unit: 'day', timezone: period.timezone } } } },
      ...nutritionGroupStages(),
    ]),
    UserSettings.findOne({ userId }).select('goals').lean(),
  ])
  const byDate = new Map<string, Record<string, unknown>>()
  for (const row of aggregates) byDate.set(dateKeyInTimezone(row._id as Date, period.timezone), row)
  const days = Array.from({ length: period.range }, (_, index) => {
    const date = shiftDateKey(period.startDate, index)
    const row = byDate.get(date)
    const nutrition = Object.fromEntries(nutritionFields.map(({ field, total, count }) => [field, dailyNumber(row?.[total], row?.[count])]))
    return {
      date,
      mealCount: typeof row?.mealCount === 'number' ? row.mealCount : 0,
      caloriesTotal: nutrition.calories ?? null,
      proteinGTotal: nutrition.proteinG ?? null,
      carbsGTotal: nutrition.carbsG ?? null,
      fatGTotal: nutrition.fatG ?? null,
      recorded: Object.fromEntries(nutritionFields.map(({ field, count }) => [field, typeof row?.[count] === 'number' ? row[count] : 0])),
    }
  })
  return {
    period: { startDate: period.startDate, endDate: period.endDate, timezone: period.timezone, dayCount: period.range },
    goals: configuredGoals(settings as { goals?: Record<string, unknown> } | null),
    days,
  }
}

const cueKeyExpression = {
  $ifNull: ['$eatingCueDetail', {
    $switch: {
      branches: [
        { case: { $eq: ['$eatingCue', 'HUNGRY'] }, then: 'PHYSICAL_HUNGER' },
        { case: { $eq: ['$eatingCue', 'CRAVING'] }, then: 'CRAVINGS' },
        { case: { $eq: ['$eatingCue', 'OVERATE'] }, then: 'OTHER' },
        { case: { $eq: ['$eatingCue', 'JUST_BECAUSE'] }, then: 'OTHER' },
      ],
      default: null,
    },
  }],
}

const daypartExpression = {
  $switch: {
    branches: [
      { case: { $lt: ['$localHour', 5] }, then: 'Overnight' },
      { case: { $lt: ['$localHour', 11] }, then: 'Morning' },
      { case: { $lt: ['$localHour', 15] }, then: 'Midday' },
      { case: { $lt: ['$localHour', 18] }, then: 'Afternoon' },
      { case: { $lt: ['$localHour', 22] }, then: 'Evening' },
    ],
    default: 'Late night',
  },
}

function groupedCountPipeline(match: Record<string, unknown>, key: unknown, output = '_id'): PipelineStage.FacetPipelineStage[] {
  return [
    { $match: match },
    { $group: { _id: key, count: { $sum: 1 } } },
    { $sort: { count: -1, [output]: 1 } },
  ]
}

function periodSummaryPipeline(): PipelineStage.FacetPipelineStage[] {
  return [{ $group: {
    _id: null,
    mealCount: { $sum: 1 },
    unplannedCount: { $sum: { $cond: [{ $eq: ['$logType', 'UNPLANNED'] }, 1, 0] } },
    cueTaggedCount: { $sum: { $cond: [{ $ne: ['$cueKey', null] }, 1, 0] } },
    hungerCount: { $sum: { $cond: [{ $isNumber: '$hungerLevel' }, 1, 0] } },
    hungerTotal: { $sum: { $cond: [{ $isNumber: '$hungerLevel' }, '$hungerLevel', 0] } },
    moodBeforeCount: { $sum: { $cond: [{ $ne: ['$moodBeforeKey', ''] }, 1, 0] } },
    moodAfterCount: { $sum: { $cond: [{ $ne: ['$moodAfterKey', ''] }, 1, 0] } },
    moodTransitionCount: { $sum: { $cond: [{ $and: [{ $ne: ['$moodBeforeKey', ''] }, { $ne: ['$moodAfterKey', ''] }] }, 1, 0] } },
    moodSameCount: { $sum: { $cond: [{ $and: [{ $ne: ['$moodBeforeKey', ''] }, { $eq: ['$moodBeforeKey', '$moodAfterKey'] }] }, 1, 0] } },
  } }]
}

function countItems(rows: Array<{ _id: unknown; count: number }>, total: number, label: (key: string) => string = (key) => key) {
  return rows.map((row) => {
    const key = String(row._id)
    return { key, label: label(key), count: row.count, percentage: total > 0 ? Math.round((row.count / total) * 100) : 0 }
  })
}

const cueLabels: Record<string, string> = {
  PHYSICAL_HUNGER: 'Physical hunger', CRAVINGS: 'Cravings', STRESS: 'Stress', BOREDOM: 'Boredom',
  EMOTIONAL_EATING: 'Emotional eating', SOCIAL_OCCASION: 'Social occasion', CONVENIENCE: 'Convenience', OTHER: 'Other',
}
const categoryLabels: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snacks' }
const hungerLabels: Record<string, string> = { '1': 'Not hungry', '2': 'Slightly hungry', '3': 'Moderately hungry', '4': 'Very hungry', '5': 'Extremely hungry' }
const readable = (key: string) => key.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase())

function outputCount(rows: Array<{ _id: unknown; count: number }> | undefined, total: number, labels?: Record<string, string>) {
  return countItems(rows ?? [], total, (key) => labels?.[key] ?? readable(key))
}

function summaryValues(rows: Array<Record<string, unknown>>) {
  const row = rows[0] ?? {}
  const hungerCount = typeof row.hungerCount === 'number' ? row.hungerCount : 0
  const same = typeof row.moodSameCount === 'number' ? row.moodSameCount : 0
  const transitions = typeof row.moodTransitionCount === 'number' ? row.moodTransitionCount : 0
  return {
    mealCount: typeof row.mealCount === 'number' ? row.mealCount : 0,
    unplannedCount: typeof row.unplannedCount === 'number' ? row.unplannedCount : 0,
    cueTaggedCount: typeof row.cueTaggedCount === 'number' ? row.cueTaggedCount : 0,
    hungerCount,
    averageHunger: hungerCount && typeof row.hungerTotal === 'number' ? row.hungerTotal / hungerCount : null,
    moodBeforeCount: typeof row.moodBeforeCount === 'number' ? row.moodBeforeCount : 0,
    moodAfterCount: typeof row.moodAfterCount === 'number' ? row.moodAfterCount : 0,
    moodTransitionCount: transitions,
    moodSameCount: same,
    moodDifferentCount: transitions - same,
  }
}

function analyticsNormalizationStages(timezone: string): PipelineStage[] {
  return [{ $set: {
    cueKey: cueKeyExpression,
    localHour: { $hour: { date: '$loggedAt', timezone } },
    localDay: { $dateTrunc: { date: '$loggedAt', unit: 'day', timezone } },
    moodBeforeKey: { $toLower: { $trim: { input: { $ifNull: ['$moodBefore', ''] } } } },
    moodAfterKey: { $toLower: { $trim: { input: { $ifNull: ['$moodAfter', ''] } } } },
  } }]
}

function currentAnalyticsFacet(): PipelineStage.Facet['$facet'] {
  return {
    summary: periodSummaryPipeline(),
    cues: groupedCountPipeline({ cueKey: { $ne: null } }, '$cueKey'),
    hunger: groupedCountPipeline({ hungerLevel: { $type: 'number', $gte: 1, $lte: 5 } }, '$hungerLevel'),
    categories: groupedCountPipeline({}, '$mealType'),
    unplannedCategories: groupedCountPipeline({ logType: 'UNPLANNED' }, '$mealType'),
    dayparts: groupedCountPipeline({}, daypartExpression),
    unplannedDayparts: groupedCountPipeline({ logType: 'UNPLANNED' }, daypartExpression),
    commonHours: [
      { $group: { _id: '$localHour', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 5 },
    ],
    moodsBefore: groupedCountPipeline({ moodBeforeKey: { $ne: '' } }, '$moodBeforeKey'),
    moodsAfter: groupedCountPipeline({ moodAfterKey: { $ne: '' } }, '$moodAfterKey'),
    cueMoods: groupedCountPipeline({ cueKey: { $ne: null }, moodBeforeKey: { $ne: '' } }, { cue: '$cueKey', mood: '$moodBeforeKey' }),
    daily: [
      { $group: {
        _id: '$localDay',
        mealCount: { $sum: 1 },
        regularCount: { $sum: { $cond: [{ $eq: ['$logType', 'REGULAR'] }, 1, 0] } },
        unplannedCount: { $sum: { $cond: [{ $eq: ['$logType', 'UNPLANNED'] }, 1, 0] } },
        cueCount: { $sum: { $cond: [{ $ne: ['$cueKey', null] }, 1, 0] } },
        averageHunger: { $avg: { $cond: [{ $isNumber: '$hungerLevel' }, '$hungerLevel', null] } },
      } },
      { $sort: { _id: 1 } },
    ],
  }
}

export async function getPatternsAnalytics(userId: string, query: RangeAnalyticsQuery) {
  const period = resolveRange(query)
  const previousEndDate = shiftDateKey(period.startDate, -1)
  const previousStartDate = shiftDateKey(previousEndDate, -period.range + 1)
  const previousStart = startOfDateInTimezone(previousStartDate, period.timezone)
  const currentStart = startOfDateInTimezone(period.startDate, period.timezone)
  const currentEnd = startOfDateInTimezone(shiftDateKey(period.endDate, 1), period.timezone)
  const previousEnd = currentStart
  const userObjectId = new mongoose.Types.ObjectId(userId)
  const [currentRows, previousRows] = await Promise.all([
    Meal.aggregate([
      { $match: { userId: userObjectId, loggedAt: { $gte: currentStart, $lt: currentEnd } } },
      ...analyticsNormalizationStages(period.timezone),
      { $facet: currentAnalyticsFacet() },
    ]).exec(),
    Meal.aggregate([
      { $match: { userId: userObjectId, loggedAt: { $gte: previousStart, $lt: previousEnd } } },
      ...analyticsNormalizationStages(period.timezone),
      ...periodSummaryPipeline(),
    ]).exec(),
  ])

  const current = currentRows[0] ?? {}
  const summary = summaryValues(current.summary ?? [])
  const previous = summaryValues(previousRows)
  const cueDistribution = outputCount(current.cues, summary.cueTaggedCount, cueLabels)
  const hungerDistribution = outputCount(current.hunger, summary.hungerCount, hungerLabels)
  const mealCategoryDistribution = outputCount(current.categories, summary.mealCount, categoryLabels)
  const daypartDistribution = outputCount(current.dayparts, summary.mealCount)
  const unplannedDaypartDistribution = outputCount(current.unplannedDayparts, summary.unplannedCount)
  const firstHunger = (current.daily ?? []).find((day: { averageHunger: number | null }) => day.averageHunger !== null)?.averageHunger ?? null
  const lastHunger = [...(current.daily ?? [])].reverse().find((day: { averageHunger: number | null }) => day.averageHunger !== null)?.averageHunger ?? null
  const moodBeforeDistribution = outputCount(current.moodsBefore, summary.moodBeforeCount)
  const moodAfterDistribution = outputCount(current.moodsAfter, summary.moodAfterCount)
  const mostCommon = hungerDistribution.filter((item) => item.count > 0)
  const maxHungerCount = Math.max(0, ...mostCommon.map((item) => item.count))
  const topHunger = mostCommon.filter((item) => item.count === maxHungerCount)
  const dailyTrend = Array.from({ length: period.range }, (_, index) => {
    const dateKey = shiftDateKey(period.startDate, index)
    const row = (current.daily ?? []).find((day: { _id: Date }) => dateKeyInTimezone(day._id, period.timezone) === dateKey)
    const date = new Date(`${dateKey}T12:00:00Z`)
    return {
      dateKey,
      label: new Intl.DateTimeFormat('en', { timeZone: period.timezone, month: 'short', day: 'numeric' }).format(date),
      mealCount: row?.mealCount ?? 0,
      regularCount: row?.regularCount ?? 0,
      unplannedCount: row?.unplannedCount ?? 0,
      cueCount: row?.cueCount ?? 0,
      averageHunger: row?.averageHunger ?? null,
    }
  })
  const cueMoodAssociations = (current.cueMoods ?? []).map((row: { _id: { cue: string; mood: string }; count: number }) => ({
    cue: row._id.cue,
    cueLabel: cueLabels[row._id.cue] ?? readable(row._id.cue),
    mood: readable(row._id.mood),
    count: row.count,
  }))
  const commonHours = (current.commonHours ?? []).map((row: { _id: number; count: number }) => ({
    hour: row._id,
    label: new Intl.DateTimeFormat('en', { hour: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, 0, 1, row._id))),
    count: row.count,
  }))
  return {
    range: period.range,
    startDate: period.startDate,
    endDate: period.endDate,
    previousStartDate,
    previousEndDate,
    timezone: period.timezone,
    mealCount: summary.mealCount,
    previousMealCount: previous.mealCount,
    unplannedCount: summary.unplannedCount,
    previousUnplannedCount: previous.unplannedCount,
    cueTaggedCount: summary.cueTaggedCount,
    previousCueTaggedCount: previous.cueTaggedCount,
    hungerCount: summary.hungerCount,
    averageHunger: summary.averageHunger,
    mostCommonHunger: topHunger.length === 1 ? topHunger[0]!.label : null,
    dailyHungerRange: { first: firstHunger, last: lastHunger, change: firstHunger !== null && lastHunger !== null ? lastHunger - firstHunger : null },
    cueDistribution,
    hungerDistribution,
    mealCategoryDistribution,
    unplannedCategoryDistribution: outputCount(current.unplannedCategories, summary.unplannedCount, categoryLabels),
    daypartDistribution,
    unplannedDaypartDistribution,
    commonHours,
    moodBeforeDistribution,
    moodAfterDistribution,
    moodTransitionCount: summary.moodTransitionCount,
    moodSameCount: summary.moodSameCount,
    moodDifferentCount: summary.moodDifferentCount,
    cueMoodAssociations,
    dailyTrend,
  }
}
