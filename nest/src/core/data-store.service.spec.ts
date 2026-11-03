import type { TestingModule } from '@nestjs/testing';
import { createCoreTestingModule } from '../../test/create-core-module.js';
import { toDayNumber } from '../common/utils/date.util.js';
import { DataStoreService } from './data-store.service.js';
import { TimeService } from './time.service.js';

describe('DataStoreService (real seed files)', () => {
  let moduleRef: TestingModule;
  let store: DataStoreService;

  beforeAll(async () => {
    moduleRef = await createCoreTestingModule([]);
    store = moduleRef.get(DataStoreService);
  });

  afterAll(() => moduleRef.close());

  it('loads every record from the three files', () => {
    expect(store.getFlightHours()).toHaveLength(521);
    expect(store.getDocuments()).toHaveLength(5);
    expect(store.getSchedules()).toHaveLength(54);
    expect(store.getLegend()).toHaveLength(10);
  });

  it('keeps flight hours sorted and covering the documented range', () => {
    const hours = store.getFlightHours();
    expect(hours[0].date).toBe('2024-12-27');
    expect(hours.at(-1)?.date).toBe('2026-05-31');
  });

  it('returns 0 hours for dates outside the dataset', () => {
    expect(store.getHoursOnDay(toDayNumber('2024-12-27'))).toBe(5.7);
    expect(store.getHoursOnDay(toDayNumber('2024-12-26'))).toBe(0);
    expect(store.getHoursOnDay(toDayNumber('2026-06-01'))).toBe(0);
  });

  it('exposes pilot, limits, chart bounds and thresholds', () => {
    expect(store.getPilot()).toEqual({ name: 'John Doe', totalFlightHours: 1444.5 });
    expect(store.getLimits()).toEqual({ daily: 8, weekly: 40, monthly: 100, annual: 1050 });
    expect(store.getChartBound('1y')).toEqual({ limit: 1050, max: 1200, windowDays: 365, displayRangeDays: 7 });
    expect(store.getWarningDays()).toBe(30);
  });

  it('follows the legend codes from mock-schedules.json', () => {
    expect(store.getLegend().map((entry) => entry.code)).toEqual([
      'DTY', 'RLV', 'SCK', 'TRD', 'TRX', 'ADM', 'FER', 'MED', 'REC', 'ULV',
    ]);
  });

  it('reads "today" from APP_TODAY, not from the JSON files', () => {
    expect(moduleRef.get(TimeService).getToday()).toBe('2026-05-15');
  });
});
