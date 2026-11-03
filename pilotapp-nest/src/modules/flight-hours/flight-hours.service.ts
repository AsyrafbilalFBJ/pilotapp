import { BadRequestException, Injectable } from '@nestjs/common';
import {
  formatShortDate,
  formatWeekdayDate,
  fromDayNumber,
  roundHours,
  toDayNumber,
} from '../../common/utils/date.util.js';
import { DataStoreService } from '../../core/data-store.service.js';
import { TimeService } from '../../core/time.service.js';
import type { DutyLimits, SummaryRange } from '../../core/types/datasource.types.js';
import type {
  ChartPointDto,
  DailyFlightHoursDto,
  FlightHoursRangeDto,
  FlightHoursSummaryDto,
  LimitCardDto,
  LimitCardStatus,
  LimitCardType,
} from './dto/flight-hours-response.dto.js';

/** Largest range GET /flight-hours accepts, so one request cannot build an unbounded response. */
export const MAX_RANGE_DAYS = 731;

/** The four limit cards, in display order. `limit` comes from mock-flight-hours.json. */
const CARD_DEFINITIONS: readonly {
  type: LimitCardType;
  label: string;
  windowDays: number;
  windowDescription: string;
}[] = [
  { type: 'daily', label: 'Daily Limit', windowDays: 1, windowDescription: 'Today only' },
  { type: 'weekly', label: 'Weekly Limit', windowDays: 7, windowDescription: 'Rolling 7 days' },
  { type: 'monthly', label: 'Monthly Limit', windowDays: 30, windowDescription: 'Rolling 30 days' },
  { type: 'annual', label: 'Annual Limit', windowDays: 365, windowDescription: 'Rolling 365 days' },
];

/** Card status boundaries, in percent of the limit. */
export const CARD_WARNING_FROM_PERCENT = 70;
export const CARD_DANGER_FROM_PERCENT = 90;

/**
 * Flight-hour queries and the rolling-sum maths.
 *
 * Rules used throughout:
 * - A date with no record counts as 0 hours. Dates are never skipped.
 * - A window that starts before the first dataset date counts those earlier days as 0
 *   and is flagged with `isPartialWindow`.
 * - Dates after "today" use the hours in the dataset, treated as planned hours, so future
 *   points are a projection of the rolling sum if the pilot flies as planned. Dates past
 *   the end of the dataset count as 0.
 */
@Injectable()
export class FlightHoursService {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly time: TimeService,
  ) {}

  getDailyHours(from: string, to: string): FlightHoursRangeDto {
    const fromDay = toDayNumber(from);
    const toDay = toDayNumber(to);
    if (fromDay > toDay) {
      throw new BadRequestException('from must be on or before to');
    }
    const length = toDay - fromDay + 1;
    if (length > MAX_RANGE_DAYS) {
      throw new BadRequestException(`The range from..to cannot be longer than ${MAX_RANGE_DAYS} days`);
    }

    const todayDay = toDayNumber(this.time.getToday());
    const days: DailyFlightHoursDto[] = [];
    let total = 0;
    for (let day = fromDay; day <= toDay; day++) {
      const hours = this.dataStore.getHoursOnDay(day);
      total += hours;
      const date = fromDayNumber(day);
      days.push({ date, formattedDate: formatWeekdayDate(date), hours, isFuture: day > todayDay });
    }

    return { from, to, today: this.time.getToday(), days, totalHours: roundHours(total) };
  }

  getSummary(range: SummaryRange): FlightHoursSummaryDto {
    const today = this.time.getToday();
    const todayDay = toDayNumber(today);
    const { limit, max, windowDays, displayRangeDays } = this.dataStore.getChartBound(range);
    const firstDataDay = this.firstDataDay();

    const series: ChartPointDto[] = [];
    for (let offset = -displayRangeDays; offset <= displayRangeDays; offset++) {
      const day = todayDay + offset;
      const date = fromDayNumber(day);
      const rollingSum = this.rollingSum(day, windowDays);
      series.push({
        date,
        formattedDate: formatShortDate(date),
        rollingSum,
        dailyHours: this.dataStore.getHoursOnDay(day),
        isToday: offset === 0,
        isExceeded: rollingSum > limit,
        isFuture: offset > 0,
        isPartialWindow: firstDataDay !== undefined && day - windowDays + 1 < firstDataDay,
      });
    }

    return {
      today,
      selectedRange: range,
      cards: this.limitCards(todayDay, this.dataStore.getLimits()),
      chart: { range, limitLine: limit, yAxisMax: max, windowDays, displayRangeDays, series },
    };
  }

  /** Sum of hours for the `windowDays` days ending on (and including) `endDay`. */
  rollingSum(endDay: number, windowDays: number): number {
    let sum = 0;
    for (let day = endDay - windowDays + 1; day <= endDay; day++) {
      sum += this.dataStore.getHoursOnDay(day);
    }
    return roundHours(sum);
  }

  /** safe below 70 %, warning from 70 %, danger from 90 % or whenever the limit is exceeded. */
  cardStatus(percentage: number, isExceeded: boolean): LimitCardStatus {
    if (isExceeded || percentage >= CARD_DANGER_FROM_PERCENT) {
      return 'danger';
    }
    if (percentage >= CARD_WARNING_FROM_PERCENT) {
      return 'warning';
    }
    return 'safe';
  }

  private limitCards(todayDay: number, limits: DutyLimits): LimitCardDto[] {
    return CARD_DEFINITIONS.map(({ type, label, windowDays, windowDescription }) => {
      const limit = limits[type];
      const currentHours = this.rollingSum(todayDay, windowDays);
      // Status uses the rounded percentage so it always agrees with the number the card shows.
      const percentage = limit > 0 ? Math.round((currentHours / limit) * 1000) / 10 : 0;
      const isExceeded = currentHours > limit;
      return {
        type,
        label,
        limit,
        currentHours,
        percentage,
        remainingHours: roundHours(Math.max(0, limit - currentHours)),
        isExceeded,
        status: this.cardStatus(percentage, isExceeded),
        windowDescription,
        windowDays,
      };
    });
  }

  private firstDataDay(): number | undefined {
    const first = this.dataStore.getFlightHours()[0];
    return first ? toDayNumber(first.date) : undefined;
  }
}
