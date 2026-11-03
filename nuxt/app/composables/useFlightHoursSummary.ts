import type { FlightHoursSummary, SummaryRange } from '~/types/api'

/**
 * GET /flight-hours/summary?range= — limit cards and the rolling-sum chart (Home).
 * Refetches whenever `range` changes; the previous data stays on screen meanwhile.
 */
export function useFlightHoursSummary(range: MaybeRefOrGetter<SummaryRange>) {
  const api = useApi()
  return useAsyncData(
    'flight-hours-summary',
    () => api<FlightHoursSummary>('/flight-hours/summary', { query: { range: toValue(range) } }),
    { watch: [() => toValue(range)] },
  )
}
