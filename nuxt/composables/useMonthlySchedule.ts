import type { SchedulesResponse } from '~/types/api'
import type { YearMonth } from '~/utils/calendar'

/**
 * GET /schedules?year=&month= — one month of the calendar (Schedule).
 * Refetches whenever `month` changes.
 */
export function useMonthlySchedule(month: MaybeRefOrGetter<YearMonth>) {
  const api = useApi()
  return useAsyncData(
    'schedule-month',
    () => {
      const { year, month: monthNumber } = toValue(month)
      return api<SchedulesResponse>('/schedules', { query: { year, month: monthNumber } })
    },
    { watch: [() => toValue(month)] },
  )
}
