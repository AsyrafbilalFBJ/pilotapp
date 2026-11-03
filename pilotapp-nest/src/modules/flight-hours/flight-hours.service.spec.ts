import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { createCoreTestingModule } from '../../../test/create-core-module.js';
import { addDays } from '../../common/utils/date.util.js';
import { FlightHoursService } from './flight-hours.service.js';

/** Independent reference: sum the raw JSON entries whose date falls in the window. */
const raw = JSON.parse(
  readFileSync(resolve(process.cwd(), 'src/datasource/mock-flight-hours.json'), 'utf8'),
) as { flightHours: { date: string; hours: number }[] };

function referenceSum(endDate: string, windowDays: number): number {
  const startDate = addDays(endDate, -(windowDays - 1));
  const sum = raw.flightHours
    .filter((entry) => entry.date >= startDate && entry.date <= endDate)
    .reduce((total, entry) => total + entry.hours, 0);
  return Math.round(sum * 100) / 100;
}

/** The response the user supplied as the target for GET /flight-hours/summary?range=1w. */
const REFERENCE_1W = {
  today: '2026-05-15',
  selectedRange: '1w',
  cards: [
    { type: 'daily', label: 'Daily Limit', limit: 8, currentHours: 6.4, percentage: 80, remainingHours: 1.6, isExceeded: false, status: 'warning', windowDescription: 'Today only' },
    { type: 'weekly', label: 'Weekly Limit', limit: 40, currentHours: 25.2, percentage: 63, remainingHours: 14.8, isExceeded: false, status: 'safe', windowDescription: 'Rolling 7 days' },
    { type: 'monthly', label: 'Monthly Limit', limit: 100, currentHours: 87.2, percentage: 87.2, remainingHours: 12.8, isExceeded: false, status: 'warning', windowDescription: 'Rolling 30 days' },
    { type: 'annual', label: 'Annual Limit', limit: 1050, currentHours: 1013.8, percentage: 96.6, remainingHours: 36.2, isExceeded: false, status: 'danger', windowDescription: 'Rolling 365 days' },
  ],
  chart: {
    range: '1w',
    limitLine: 40,
    yAxisMax: 45,
    windowDays: 7,
    displayRangeDays: 7,
    series: [
      ['2026-05-08', '8 May', 15, 5.2],
      ['2026-05-09', '9 May', 15, 0],
      ['2026-05-10', '10 May', 16.6, 1.6],
      ['2026-05-11', '11 May', 12.6, 0],
      ['2026-05-12', '12 May', 16.3, 4.6],
      ['2026-05-13', '13 May', 22.2, 5.9],
      ['2026-05-14', '14 May', 24, 6.7],
      ['2026-05-15', '15 May', 25.2, 6.4],
      ['2026-05-16', '16 May', 31.4, 6.2],
      ['2026-05-17', '17 May', 36.4, 6.6],
      ['2026-05-18', '18 May', 42.8, 6.4],
      ['2026-05-19', '19 May', 44, 5.8],
      ['2026-05-20', '20 May', 44.7, 6.6],
      ['2026-05-21', '21 May', 42.7, 4.7],
      ['2026-05-22', '22 May', 36.3, 0],
    ].map(([date, formattedDate, rollingSum, dailyHours]) => ({
      date,
      formattedDate,
      rollingSum,
      dailyHours,
      isToday: date === '2026-05-15',
      isExceeded: (rollingSum as number) > 40,
    })),
  },
};

const REFERENCE_1M_ROLLING = [102.2, 96.4, 92.5, 86.9, 85.3, 84.8, 87, 87.2, 87.6, 88, 89.3, 92.6, 96.2, 100.9, 98.7];
const REFERENCE_3M_ROLLING = [252.3, 249.3, 245.1, 240.2, 239.7, 239.3, 241.2, 247.6, 247.4, 254, 254.9, 253.9, 260.5, 258.9, 254.3];

async function serviceFor(today?: string): Promise<{ service: FlightHoursService; close: () => Promise<void> }> {
  const moduleRef: TestingModule = await createCoreTestingModule([FlightHoursService], today);
  return { service: moduleRef.get(FlightHoursService), close: () => moduleRef.close() };
}

describe('FlightHoursService', () => {
  describe('getSummary (today = 2026-05-15)', () => {
    let service: FlightHoursService;
    let close: () => Promise<void>;

    beforeAll(async () => {
      ({ service, close } = await serviceFor());
    });
    afterAll(() => close());

    it('matches the reference response for range=1w', () => {
      expect(service.getSummary('1w')).toMatchObject(REFERENCE_1W);
    });

    it('matches the reference rolling sums for range=1m and range=3m', () => {
      expect(service.getSummary('1m').chart.series.map((p) => p.rollingSum)).toEqual(REFERENCE_1M_ROLLING);
      expect(service.getSummary('3m').chart.series.map((p) => p.rollingSum)).toEqual(REFERENCE_3M_ROLLING);
      expect(service.getSummary('1m').chart).toMatchObject({ range: '1m', limitLine: 100, yAxisMax: 125, windowDays: 30 });
      expect(service.getSummary('3m').chart).toMatchObject({ range: '3m', limitLine: 300, yAxisMax: 325, windowDays: 90 });
    });

    it('returns 15 points with today in the centre', () => {
      const { series } = service.getSummary('1w').chart;
      expect(series).toHaveLength(15);
      expect(series[0]).toMatchObject({ date: '2026-05-08', formattedDate: '8 May' });
      expect(series[7]).toMatchObject({ date: '2026-05-15', isToday: true, isFuture: false });
      expect(series[14]).toMatchObject({ date: '2026-05-22', isFuture: true });
      expect(series.filter((point) => point.isToday)).toHaveLength(1);
    });

    it('uses the chart bounds of the selected range', () => {
      const bounds = { '1w': [40, 45, 7], '1m': [100, 125, 30], '3m': [300, 325, 90], '6m': [600, 625, 180], '1y': [1050, 1200, 365] } as const;
      for (const [range, [limitLine, yAxisMax, windowDays]] of Object.entries(bounds)) {
        const summary = service.getSummary(range as keyof typeof bounds);
        expect(summary.selectedRange).toBe(range);
        expect(summary.chart).toMatchObject({ range, limitLine, yAxisMax, windowDays, displayRangeDays: 7 });
      }
    });

    it('matches an independent sum for every point of every range', () => {
      for (const range of ['1w', '1m', '3m', '6m', '1y'] as const) {
        const { chart } = service.getSummary(range);
        for (const point of chart.series) {
          expect(point.rollingSum, `${range} @ ${point.date}`).toBe(referenceSum(point.date, chart.windowDays));
          expect(point.dailyHours, `${range} @ ${point.date}`).toBe(referenceSum(point.date, 1));
          expect(point.isExceeded).toBe(point.rollingSum > chart.limitLine);
        }
      }
    });

    it('keeps the extra fields: isFuture, isPartialWindow and windowDays', () => {
      const { cards, chart } = service.getSummary('1w');
      expect(chart.series.map((p) => p.isFuture)).toEqual([...Array(8).fill(false), ...Array(7).fill(true)]);
      expect(chart.series.every((p) => p.isPartialWindow === false)).toBe(true);
      expect(cards.map((c) => c.windowDays)).toEqual([1, 7, 30, 365]);
    });

    it('returns the same cards whatever the range', () => {
      expect(service.getSummary('1y').cards).toEqual(service.getSummary('1w').cards);
    });

    it('applies the card status boundaries', () => {
      expect(service.cardStatus(69.9, false)).toBe('safe');
      expect(service.cardStatus(70, false)).toBe('warning');
      expect(service.cardStatus(89.9, false)).toBe('warning');
      expect(service.cardStatus(90, false)).toBe('danger');
      expect(service.cardStatus(50, true)).toBe('danger');
    });
  });

  describe('getSummary edge cases', () => {
    it('counts days before the dataset as 0 and flags the window as partial', async () => {
      const { service, close } = await serviceFor('2025-01-01');
      try {
        const { series } = service.getSummary('1y').chart;
        // Only 2024-12-27 .. 2025-01-01 exist: 5.7 + 0 + 3.4 + 0 + 0 + 3.2
        expect(series[7]).toMatchObject({ date: '2025-01-01', rollingSum: 12.3, isPartialWindow: true });
        expect(series[0]).toMatchObject({ date: '2024-12-25', rollingSum: 0, dailyHours: 0 });
      } finally {
        await close();
      }
    });

    it('counts days after the dataset as 0', async () => {
      const { service, close } = await serviceFor('2026-05-31');
      try {
        const { series } = service.getSummary('1w').chart;
        expect(series.find((p) => p.date === '2026-06-06')?.rollingSum).toBe(4.3); // only 05-31 in window
        expect(series.find((p) => p.date === '2026-06-07')).toMatchObject({ rollingSum: 0, dailyHours: 0 });
      } finally {
        await close();
      }
    });

    it('marks a card as danger when its limit is exceeded', async () => {
      // 1w rolling sum on 2026-05-20 is 44.7 > 40.
      const { service, close } = await serviceFor('2026-05-20');
      try {
        const weekly = service.getSummary('1w').cards.find((c) => c.type === 'weekly');
        expect(weekly).toMatchObject({ currentHours: 44.7, percentage: 111.8, remainingHours: 0, isExceeded: true, status: 'danger' });
      } finally {
        await close();
      }
    });
  });

  describe('getDailyHours', () => {
    let service: FlightHoursService;
    let close: () => Promise<void>;

    beforeAll(async () => {
      ({ service, close } = await serviceFor());
    });
    afterAll(() => close());

    it('returns one entry per day, inclusive', () => {
      const result = service.getDailyHours('2026-05-01', '2026-05-15');
      expect(result.days).toHaveLength(15);
      expect(result.days[0]).toEqual({ date: '2026-05-01', formattedDate: 'Fri, 1 May', hours: 3.8, isFuture: false });
      expect(result.days[14]).toMatchObject({ date: '2026-05-15', formattedDate: 'Fri, 15 May' });
      expect(result.totalHours).toBe(referenceSum('2026-05-15', 15));
    });

    it('fills dates outside the dataset with 0', () => {
      const result = service.getDailyHours('2024-12-25', '2024-12-28');
      expect(result.days.map((d) => d.hours)).toEqual([0, 0, 5.7, 0]);
    });

    it('flags dates after today as future', () => {
      const result = service.getDailyHours('2026-05-15', '2026-05-16');
      expect(result.days.map((d) => d.isFuture)).toEqual([false, true]);
    });

    it('rejects from after to, and ranges that are too long', () => {
      expect(() => service.getDailyHours('2026-05-16', '2026-05-15')).toThrow(BadRequestException);
      expect(() => service.getDailyHours('2020-01-01', '2026-01-01')).toThrow(BadRequestException);
    });
  });
});
