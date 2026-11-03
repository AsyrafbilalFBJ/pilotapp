/**
 * Response shapes of the pilotapp-nest API.
 * They mirror the backend DTOs; see the Swagger docs at <api>/docs.
 */

export interface ApiErrorResponse {
  statusCode: number
  /** A single message, or one message per problem for validation errors. */
  message: string | string[]
  error: string
  timestamp: string
  path: string
}

export interface HealthResponse {
  status: 'ok'
  /** APP_TODAY on the server, `YYYY-MM-DD`. The frontend never reads the system clock. */
  today: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface PilotProfile {
  name: string
  totalFlightHours: number
  avatarUrl: string
}

export const SUMMARY_RANGES = ['1w', '1m', '3m', '6m', '1y'] as const
export type SummaryRange = (typeof SUMMARY_RANGES)[number]

export type LimitCardType = 'daily' | 'weekly' | 'monthly' | 'annual'
export type LimitCardStatus = 'safe' | 'warning' | 'danger'

export interface LimitCard {
  type: LimitCardType
  label: string
  limit: number
  currentHours: number
  percentage: number
  remainingHours: number
  isExceeded: boolean
  status: LimitCardStatus
  windowDescription: string
  windowDays: number
}

export interface ChartPoint {
  date: string
  formattedDate: string
  rollingSum: number
  dailyHours: number
  isToday: boolean
  isExceeded: boolean
  isFuture: boolean
  isPartialWindow: boolean
}

export interface FlightHoursChart {
  range: SummaryRange
  limitLine: number
  yAxisMax: number
  windowDays: number
  displayRangeDays: number
  series: ChartPoint[]
}

export interface FlightHoursSummary {
  today: string
  selectedRange: SummaryRange
  cards: LimitCard[]
  chart: FlightHoursChart
}

export type DocumentStatus = 'expired' | 'soon' | 'safe'

export interface PilotDocument {
  id: string
  label: string
  expiryDate: string
  /** e.g. "29 May 2026" */
  formattedExpiryDate: string
  daysRemaining: number
  status: DocumentStatus
}

export interface DocumentsResponse {
  today: string
  warningDays: number
  documents: PilotDocument[]
}

export interface DailyFlightHours {
  date: string
  /** e.g. "Fri, 15 May" */
  formattedDate: string
  hours: number
  /** After "today": planned hours, not yet flown. */
  isFuture: boolean
}

export interface FlightHoursRange {
  from: string
  to: string
  today: string
  days: DailyFlightHours[]
  totalHours: number
}

/** 1 = pending/upcoming, 2 = completed/verified. */
export type ScheduleStatus = 1 | 2

export interface ScheduleEntry {
  id: string
  duty_date: string
  status: ScheduleStatus
  base_name: string
  base_color: string
  duty_type: string
  count_schedules: number
  count_logbooks: number
  remaining_duties: number
  is_complete: boolean
}

export interface CalendarDay {
  date: string
  day: number
  isToday: boolean
  schedule: ScheduleEntry | null
}

export interface LegendEntry {
  code: string
  label: string
  color: string
}

export interface SchedulesResponse {
  year: number
  month: number
  /** e.g. "May 2026" */
  monthLabel: string
  today: string
  /** Empty cells before day 1 in a Monday-first week. */
  leadingBlankDays: number
  days: CalendarDay[]
  schedules: ScheduleEntry[]
  legend: LegendEntry[]
}
