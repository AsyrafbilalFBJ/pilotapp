import { ApiProperty } from '@nestjs/swagger';
import { SUMMARY_RANGES, type SummaryRange } from '../../../core/types/datasource.types.js';

export class DailyFlightHoursDto {
  @ApiProperty({ format: 'date', example: '2026-05-15' })
  date: string;

  @ApiProperty({ example: 'Fri, 15 May', description: 'date for display: short English weekday, day without leading zero, short month.' })
  formattedDate: string;

  @ApiProperty({ example: 6.4, description: '0 when the dataset has no record for the date.' })
  hours: number;

  @ApiProperty({ example: false, description: 'True when the date is after "today": the hours are planned, not yet flown.' })
  isFuture: boolean;
}

export class FlightHoursRangeDto {
  @ApiProperty({ format: 'date', example: '2026-05-01' })
  from: string;

  @ApiProperty({ format: 'date', example: '2026-05-15' })
  to: string;

  @ApiProperty({ format: 'date', example: '2026-05-15', description: 'Value of APP_TODAY.' })
  today: string;

  @ApiProperty({
    type: () => [DailyFlightHoursDto],
    description: 'One entry per calendar day from `from` to `to`; days with no record are 0.',
  })
  days: DailyFlightHoursDto[];

  @ApiProperty({ example: 50.5 })
  totalHours: number;
}

export type LimitCardType = 'daily' | 'weekly' | 'monthly' | 'annual';
export const LIMIT_CARD_TYPES: readonly LimitCardType[] = ['daily', 'weekly', 'monthly', 'annual'];

/** safe: < 70 % · warning: 70 % to < 90 % · danger: >= 90 % or above the limit. */
export type LimitCardStatus = 'safe' | 'warning' | 'danger';
export const LIMIT_CARD_STATUSES: readonly LimitCardStatus[] = ['safe', 'warning', 'danger'];

export class LimitCardDto {
  @ApiProperty({ enum: LIMIT_CARD_TYPES, example: 'weekly' })
  type: LimitCardType;

  @ApiProperty({ example: 'Weekly Limit' })
  label: string;

  @ApiProperty({ example: 40, description: 'Regulatory limit in hours.' })
  limit: number;

  @ApiProperty({ example: 25.2, description: 'Hours in the window ending today.' })
  currentHours: number;

  @ApiProperty({ example: 63, description: 'currentHours / limit × 100, rounded to 1 decimal, not capped. Above 100 means the limit is exceeded.' })
  percentage: number;

  @ApiProperty({ example: 14.8, description: 'Hours left before the limit (0 when the limit is reached or exceeded).' })
  remainingHours: number;

  @ApiProperty({ example: false, description: 'True when currentHours is above the limit.' })
  isExceeded: boolean;

  @ApiProperty({
    enum: LIMIT_CARD_STATUSES,
    example: 'safe',
    description: 'Visual indicator. safe: < 70 %. warning: 70 % to < 90 %. danger: >= 90 %, or whenever isExceeded is true.',
  })
  status: LimitCardStatus;

  @ApiProperty({ example: 'Rolling 7 days' })
  windowDescription: string;

  @ApiProperty({ example: 7, description: 'Window length in days: 1, 7, 30 or 365.' })
  windowDays: number;
}

export class ChartPointDto {
  @ApiProperty({ format: 'date', example: '2026-05-20' })
  date: string;

  @ApiProperty({ example: '20 May', description: 'X-axis label: day without leading zero + short English month.' })
  formattedDate: string;

  @ApiProperty({ example: 44.7, description: 'Sum of the `windowDays` days ending on (and including) `date`.' })
  rollingSum: number;

  @ApiProperty({ example: 6.6, description: 'Hours on `date` alone. 0 when the dataset has no record.' })
  dailyHours: number;

  @ApiProperty({ example: false })
  isToday: boolean;

  @ApiProperty({ example: true, description: 'True when rollingSum is above the red limit line.' })
  isExceeded: boolean;

  @ApiProperty({
    example: true,
    description: 'True when the date is after "today". The value is a projection that uses planned hours from the dataset.',
  })
  isFuture: boolean;

  @ApiProperty({
    example: false,
    description: 'True when the window starts before the first dataset date (2024-12-27); those earlier days count as 0.',
  })
  isPartialWindow: boolean;
}

export class FlightHoursChartDto {
  @ApiProperty({ enum: SUMMARY_RANGES, example: '1w' })
  range: SummaryRange;

  @ApiProperty({ example: 40, description: 'Red limit line for the selected range.' })
  limitLine: number;

  @ApiProperty({ example: 45, description: 'Chart Y-axis maximum for the selected range.' })
  yAxisMax: number;

  @ApiProperty({ example: 7, description: 'Rolling window of the selected range: 7, 30, 90, 180 or 365.' })
  windowDays: number;

  @ApiProperty({ example: 7, description: 'Days shown on each side of today.' })
  displayRangeDays: number;

  @ApiProperty({
    type: () => [ChartPointDto],
    description: 'today − displayRangeDays … today … today + displayRangeDays (15 points). Today is always in the centre.',
  })
  series: ChartPointDto[];
}

export class FlightHoursSummaryDto {
  @ApiProperty({ format: 'date', example: '2026-05-15', description: 'Value of APP_TODAY.' })
  today: string;

  @ApiProperty({ enum: SUMMARY_RANGES, example: '1w' })
  selectedRange: SummaryRange;

  @ApiProperty({
    type: () => [LimitCardDto],
    description: 'Always 4 cards in this order: daily, weekly, monthly, annual. They do not depend on the range.',
  })
  cards: LimitCardDto[];

  @ApiProperty({ type: () => FlightHoursChartDto })
  chart: FlightHoursChartDto;
}
