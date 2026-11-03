import type { TestingModule } from '@nestjs/testing';
import { createCoreTestingModule } from '../../../test/create-core-module.js';
import { SchedulesService } from './schedules.service.js';

describe('SchedulesService', () => {
  let moduleRef: TestingModule;
  let service: SchedulesService;

  beforeAll(async () => {
    moduleRef = await createCoreTestingModule([SchedulesService]);
    service = moduleRef.get(SchedulesService);
  });

  afterAll(() => moduleRef.close());

  it('returns only the entries of the requested month', () => {
    const counts = [4, 5, 6].map((month) => service.getMonth(2026, month).schedules.length);
    expect(counts).toEqual([17, 21, 16]);

    const may = service.getMonth(2026, 5);
    expect(may.schedules.every((entry) => entry.duty_date.startsWith('2026-05-'))).toBe(true);
    expect(may).toMatchObject({ year: 2026, month: 5, today: '2026-05-15' });
  });

  it('returns an empty list, with the legend, for a month without data', () => {
    const result = service.getMonth(2026, 7);
    expect(result.schedules).toEqual([]);
    expect(result.legend).toHaveLength(10);
    expect(result.days).toHaveLength(31);
    expect(result.days.every((d) => d.schedule === null)).toBe(true);
  });

  it('adds the calendar title and the blank cells before day 1 (Monday-first week)', () => {
    expect(service.getMonth(2026, 4)).toMatchObject({ monthLabel: 'April 2026', leadingBlankDays: 2 }); // Wed
    expect(service.getMonth(2026, 5)).toMatchObject({ monthLabel: 'May 2026', leadingBlankDays: 4 }); // Fri
    expect(service.getMonth(2026, 6)).toMatchObject({ monthLabel: 'June 2026', leadingBlankDays: 0 }); // Mon
    expect(service.getMonth(2026, 2)).toMatchObject({ monthLabel: 'February 2026', leadingBlankDays: 6 }); // Sun
  });

  it('lists every date of the month with its schedule or null', () => {
    const { days, schedules } = service.getMonth(2026, 5);
    expect(days).toHaveLength(31);
    expect(days[0]).toEqual({ date: '2026-05-01', day: 1, isToday: false, schedule: expect.objectContaining({ id: '97017' }) });
    expect(days[1]).toEqual({ date: '2026-05-02', day: 2, isToday: false, schedule: null });
    expect(days.filter((d) => d.isToday).map((d) => d.date)).toEqual(['2026-05-15']);
    expect(days.filter((d) => d.schedule !== null).map((d) => d.schedule)).toEqual(schedules);

    expect(service.getMonth(2026, 4).days).toHaveLength(30);
    expect(service.getMonth(2024, 2).days).toHaveLength(29);
  });

  it('keeps status and base colour, and derives the duty indicator', () => {
    const april = service.getMonth(2026, 4).schedules;
    expect(april.find((e) => e.id === '97005')).toMatchObject({
      status: 2,
      base_color: '#10B981',
      count_schedules: 4,
      count_logbooks: 2,
      remaining_duties: 2,
      is_complete: false,
    });
    expect(april.find((e) => e.id === '97000')).toMatchObject({ remaining_duties: 0, is_complete: true });

    const may = service.getMonth(2026, 5).schedules;
    expect(may.find((e) => e.id === '97028')).toMatchObject({ status: 1, remaining_duties: 2, is_complete: false });
  });
});
