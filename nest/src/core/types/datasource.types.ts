/** Shapes of the seed JSON files in the datasource folder. */

export type SummaryRange = '1w' | '1m' | '3m' | '6m' | '1y';

export const SUMMARY_RANGES: readonly SummaryRange[] = ['1w', '1m', '3m', '6m', '1y'];

export interface ChartBound {
  limit: number;
  max: number;
  windowDays: number;
  displayRangeDays: number;
}

export interface DutyLimits {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

export interface PilotRecord {
  name: string;
  totalFlightHours: number;
}

export interface FlightHourRecord {
  date: string;
  hours: number;
}

export interface FlightHoursFile {
  pilot: PilotRecord;
  limits: DutyLimits;
  chartBounds: Record<SummaryRange, ChartBound>;
  flightHours: FlightHourRecord[];
}

export interface DocumentRecord {
  id: string;
  label: string;
  expiryDate: string;
}

export interface DocumentsFile {
  thresholds: { warningDays: number };
  documents: DocumentRecord[];
}

/** 1 = pending/upcoming, 2 = completed/verified. */
export type ScheduleStatus = 1 | 2;

export interface ScheduleRecord {
  id: string;
  duty_date: string;
  status: ScheduleStatus;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface LegendRecord {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesFile {
  legend: LegendRecord[];
  schedules: ScheduleRecord[];
}
