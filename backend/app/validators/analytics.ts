import { z } from 'zod'

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}, 'Must be a valid YYYY-MM-DD date.')

const timezone = z.string().trim().min(1).max(80).default('UTC').refine((value) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value })
    return true
  } catch {
    return false
  }
}, 'Must be a valid IANA timezone.')

export const dashboardAnalyticsQuerySchema = z.strictObject({
  date: dateKey,
  timezone,
})

const rangeQuerySchema = z.strictObject({
  range: z.enum(['7', '30', '90']).optional(),
  startDate: dateKey.optional(),
  endDate: dateKey.optional(),
  timezone,
}).superRefine((query, context) => {
  const custom = Boolean(query.startDate || query.endDate)
  if (query.range && custom) {
    context.addIssue({ code: 'custom', path: ['range'], message: 'Choose a preset range or custom dates, not both.' })
  }
  if (!query.range && (!query.startDate || !query.endDate)) {
    context.addIssue({ code: 'custom', path: ['range'], message: 'Choose a preset range or provide both startDate and endDate.' })
  }
  if (query.startDate && query.endDate) {
    if (query.startDate > query.endDate) {
      context.addIssue({ code: 'custom', path: ['startDate'], message: 'startDate must be before or equal to endDate.' })
    }
    const duration = Date.parse(`${query.endDate}T00:00:00.000Z`) - Date.parse(`${query.startDate}T00:00:00.000Z`)
    if (duration > 365 * 86_400_000) {
      context.addIssue({ code: 'custom', path: ['endDate'], message: 'Date ranges cannot exceed 366 days.' })
    }
  }
})

export const nutritionTrendsQuerySchema = rangeQuerySchema
export const patternsAnalyticsQuerySchema = rangeQuerySchema

export type DashboardAnalyticsQuery = z.infer<typeof dashboardAnalyticsQuerySchema>
export type RangeAnalyticsQuery = z.infer<typeof rangeQuerySchema>
