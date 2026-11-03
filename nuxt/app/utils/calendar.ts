/**
 * Small helpers for the only date work the frontend does: picking which month or
 * range to ask the API for, starting from "today" (from GET /health).
 * Labels, day lists and calendar layout all come from the API.
 */

export interface YearMonth {
  year: number
  month: number
}

/** "2026-05-15" → { year: 2026, month: 5 }. */
export function yearMonthOf(isoDate: string): YearMonth {
  return { year: Number(isoDate.slice(0, 4)), month: Number(isoDate.slice(5, 7)) }
}

/** Moves by whole months, e.g. ({2026, 1}, -1) → {2025, 12}. */
export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

/** "2026-05-15" → "2026-05-01". */
export function firstOfMonth(isoDate: string): string {
  return `${isoDate.slice(0, 8)}01`
}

/** Reads ?year=&month= from the route, or undefined when missing or out of range. */
export function parseYearMonth(year: unknown, month: unknown): YearMonth | undefined {
  const y = Number(year)
  const m = Number(month)
  if (!Number.isInteger(y) || y < 1900 || y > 9999 || !Number.isInteger(m) || m < 1 || m > 12) {
    return undefined
  }
  return { year: y, month: m }
}
