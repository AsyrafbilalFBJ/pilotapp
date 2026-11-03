import { Injectable } from '@nestjs/common';
import {
  daysInMonth,
  formatMonthLabel,
  toIsoDate,
  weekdayMondayFirst,
} from '../../common/utils/date.util.js';
import { DataStoreService } from '../../core/data-store.service.js';
import { TimeService } from '../../core/time.service.js';
import type {
  CalendarDayDto,
  ScheduleEntryDto,
  SchedulesResponseDto,
} from './dto/schedule-response.dto.js';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly time: TimeService,
  ) {}

  /**
   * One month of the calendar: every date (with its entry or null), the blank cells
   * before day 1 for a Monday-first week, the legend, and the raw list of entries.
   * A month with no data returns all dates with `schedule: null` and an empty list.
   */
  getMonth(year: number, month: number): SchedulesResponseDto {
    const today = this.time.getToday();
    const prefix = toIsoDate(year, month, 1).slice(0, 8); // "YYYY-MM-"

    const schedules: ScheduleEntryDto[] = this.dataStore
      .getSchedules()
      .filter((entry) => entry.duty_date.startsWith(prefix))
      .map((entry) => ({
        ...entry,
        remaining_duties: Math.max(0, entry.count_schedules - entry.count_logbooks),
        is_complete: entry.count_logbooks === entry.count_schedules,
      }));

    // The dataset has at most one entry per date.
    const byDate = new Map(schedules.map((entry) => [entry.duty_date, entry]));
    const days: CalendarDayDto[] = Array.from({ length: daysInMonth(year, month) }, (_, index) => {
      const date = toIsoDate(year, month, index + 1);
      return { date, day: index + 1, isToday: date === today, schedule: byDate.get(date) ?? null };
    });

    const legend = this.dataStore.getLegend().map(({ code, label, color }) => ({ code, label, color }));

    return {
      year,
      month,
      monthLabel: formatMonthLabel(year, month),
      today,
      leadingBlankDays: weekdayMondayFirst(toIsoDate(year, month, 1)),
      days,
      schedules,
      legend,
    };
  }
}
