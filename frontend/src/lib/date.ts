const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

type DateParts = { year: number; month: number; day: number; hour?: number; minute?: number; second?: number }

function zonedParts(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  }
}

function parseDateKey(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) throw new RangeError('Date must use YYYY-MM-DD format.')
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new RangeError('Date is not valid on the calendar.')
  }
  return { year, month, day }
}

function wallClockDateTime(dateKey: string, timeKey: string, timeZone: string): Date {
  const { year, month, day } = parseDateKey(dateKey)
  const time = /^(\d{2}):(\d{2})$/.exec(timeKey)
  if (!time) throw new RangeError('Time must use HH:mm format.')
  const hour = Number(time[1])
  const minute = Number(time[2])
  if (hour > 23 || minute > 59) throw new RangeError('Time is not valid.')

  const targetWallClock = Date.UTC(year, month - 1, day, hour, minute)
  let instant = targetWallClock
  for (let iteration = 0; iteration < 5; iteration += 1) {
    const rendered = zonedParts(new Date(instant), timeZone)
    const renderedWallClock = Date.UTC(
      rendered.year,
      rendered.month - 1,
      rendered.day,
      rendered.hour,
      rendered.minute,
      rendered.second,
    )
    const adjustment = targetWallClock - renderedWallClock
    if (adjustment === 0) break
    instant += adjustment
  }

  const result = new Date(instant)
  const actual = zonedParts(result, timeZone)
  if (actual.year !== year || actual.month !== month || actual.day !== day || actual.hour !== hour || actual.minute !== minute) {
    throw new RangeError('That local time does not exist in the selected time zone.')
  }
  return result
}

export function localDateTimeToIso(dateKey: string, timeKey: string, timeZone = browserTimeZone): string {
  return wallClockDateTime(dateKey, timeKey, timeZone).toISOString()
}

export function getDateKeyInTimezone(date = new Date(), timeZone = browserTimeZone): string {
  const parts = zonedParts(date, timeZone)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

export function getTimeKeyInTimezone(date = new Date(), timeZone = browserTimeZone): string {
  const parts = zonedParts(date, timeZone)
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}

export function getLocalDateKey(date = new Date()): string {
  return getDateKeyInTimezone(date, browserTimeZone)
}

export function getLocalTimeKey(date = new Date()): string {
  return getTimeKeyInTimezone(date, browserTimeZone)
}

export function getDateTimeBoundsInTimezone(dateKey: string, timeZone: string): { startDate: string; endDate: string } {
  const startDate = wallClockDateTime(dateKey, '00:00', timeZone)
  const endExclusive = wallClockDateTime(shiftDateKey(dateKey, 1), '00:00', timeZone)
  return { startDate: startDate.toISOString(), endDate: new Date(endExclusive.getTime() - 1).toISOString() }
}

export function getLocalDateTimeBounds(dateKey: string): { startDate: string; endDate: string } {
  return getDateTimeBoundsInTimezone(dateKey, browserTimeZone)
}

export function mealDateKey(value: string, timeZone = browserTimeZone): string {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? getDateKeyInTimezone(date, timeZone) : ''
}

export function shiftDateKey(dateKey: string, days: number): string {
  const { year, month, day } = parseDateKey(dateKey)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

export function formatDateKey(dateKey: string, options?: Intl.DateTimeFormatOptions, timeZone = browserTimeZone): string {
  const date = wallClockDateTime(dateKey, '12:00', timeZone)
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(date)
}
