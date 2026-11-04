import type { FlightHoursRange } from '~/types/api'

export interface DateRange {
  /** `YYYY-MM-DD`, inclusive. */
  from: string
  /** `YYYY-MM-DD`, inclusive. */
  to: string
}

/**
 * GET /flight-hours?from=&to= — daily flight hours for a date range (Logbook).
 * Refetches whenever `range` changes. A wrong range comes back as a 400 in `error`.
 */
export function useFlightHours(range: MaybeRefOrGetter<DateRange>) {
  const api = useApi()
  return useAsyncData(
    'flight-hours',
    () => {
      const { from, to } = toValue(range)
      return api<FlightHoursRange>('/flight-hours', { query: { from, to } })
    },
    { watch: [() => toValue(range)] },
  )
}
