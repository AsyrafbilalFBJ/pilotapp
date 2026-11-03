import { ApiProperty } from '@nestjs/swagger';
import type { ScheduleStatus } from '../../../core/types/datasource.types.js';

export class ScheduleEntryDto {
  @ApiProperty({ example: '97028' })
  id: string;

  @ApiProperty({ format: 'date', example: '2026-05-19' })
  duty_date: string;

  @ApiProperty({ enum: [1, 2], example: 1, description: '1 = pending/upcoming, 2 = completed/verified.' })
  status: ScheduleStatus;

  @ApiProperty({ example: 'SIQ', description: 'Short code shown under the day: the airport base for DTY, otherwise the duty code.' })
  base_name: string;

  @ApiProperty({ example: '#10B981', description: 'Hex colour used to fill the day cell.' })
  base_color: string;

  @ApiProperty({ example: 'DTY', description: 'Duty code. Matches one `legend` entry.' })
  duty_type: string;

  @ApiProperty({ example: 2, description: 'Flights/duties planned for the day.' })
  count_schedules: number;

  @ApiProperty({ example: 0, description: 'Flights/duties already logged.' })
  count_logbooks: number;

  @ApiProperty({ example: 2, description: 'count_schedules − count_logbooks, never below 0. Shown as the number badge.' })
  remaining_duties: number;

  @ApiProperty({ example: false, description: 'True when count_logbooks equals count_schedules (show a tick).' })
  is_complete: boolean;
}

export class LegendEntryDto {
  @ApiProperty({ example: 'DTY' })
  code: string;

  @ApiProperty({ example: 'On Duty' })
  label: string;

  @ApiProperty({ example: '#10B981' })
  color: string;
}

export class CalendarDayDto {
  @ApiProperty({ format: 'date', example: '2026-05-19' })
  date: string;

  @ApiProperty({ example: 19, description: 'Day of the month, 1–31.' })
  day: number;

  @ApiProperty({ example: false, description: 'True when `date` equals APP_TODAY.' })
  isToday: boolean;

  @ApiProperty({
    type: () => ScheduleEntryDto,
    nullable: true,
    description: 'The entry for this date, or null when the pilot has no duty that day.',
  })
  schedule: ScheduleEntryDto | null;
}

export class SchedulesResponseDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 5 })
  month: number;

  @ApiProperty({ example: 'May 2026', description: 'Calendar title.' })
  monthLabel: string;

  @ApiProperty({ format: 'date', example: '2026-05-15', description: 'Value of APP_TODAY.' })
  today: string;

  @ApiProperty({
    example: 4,
    minimum: 0,
    maximum: 6,
    description: 'Empty cells before day 1 in a week that starts on Monday (0 when the 1st is a Monday, 6 when it is a Sunday).',
  })
  leadingBlankDays: number;

  @ApiProperty({
    type: () => [CalendarDayDto],
    description: 'Every date of the month in order (28–31 entries), each with its schedule or null.',
  })
  days: CalendarDayDto[];

  @ApiProperty({ type: () => [ScheduleEntryDto], description: 'Entries of the month, sorted by date. Empty when the month has no data.' })
  schedules: ScheduleEntryDto[];

  @ApiProperty({ type: () => [LegendEntryDto], description: 'All duty types, from mock-schedules.json.' })
  legend: LegendEntryDto[];
}
