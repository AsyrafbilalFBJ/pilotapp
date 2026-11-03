import {
  addDays,
  daysInMonth,
  diffDays,
  formatLongDate,
  formatMonthLabel,
  formatShortDate,
  formatWeekdayDate,
  fromDayNumber,
  isValidIsoDate,
  roundHours,
  toDayNumber,
  toIsoDate,
  weekdayMondayFirst,
} from './date.util.js';

describe('date.util', () => {
  it('accepts real YYYY-MM-DD dates only', () => {
    expect(isValidIsoDate('2026-05-15')).toBe(true);
    expect(isValidIsoDate('2024-02-29')).toBe(true);
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('2026-13-01')).toBe(false);
    expect(isValidIsoDate('2026-5-15')).toBe(false);
    expect(isValidIsoDate('15-05-2026')).toBe(false);
    expect(isValidIsoDate('')).toBe(false);
  });

  it('round-trips day numbers', () => {
    expect(fromDayNumber(toDayNumber('2026-05-15'))).toBe('2026-05-15');
    expect(toDayNumber('1970-01-02')).toBe(1);
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-05-15', 7)).toBe('2026-05-22');
    expect(addDays('2026-05-15', -7)).toBe('2026-05-08');
    expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('counts whole days between dates', () => {
    expect(diffDays('2026-05-29', '2026-05-15')).toBe(14);
    expect(diffDays('2026-05-01', '2026-05-15')).toBe(-14);
    expect(diffDays('2026-05-15', '2026-05-15')).toBe(0);
  });

  it('formats chart labels without a leading zero', () => {
    expect(formatShortDate('2026-05-08')).toBe('8 May');
    expect(formatShortDate('2026-05-22')).toBe('22 May');
    expect(formatShortDate('2024-12-01')).toBe('1 Dec');
    expect(formatShortDate('2025-01-31')).toBe('31 Jan');
  });

  it('formats Logbook, document and calendar labels', () => {
    expect(formatWeekdayDate('2026-05-15')).toBe('Fri, 15 May');
    expect(formatWeekdayDate('2026-05-18')).toBe('Mon, 18 May');
    expect(formatWeekdayDate('2026-05-17')).toBe('Sun, 17 May');
    expect(formatLongDate('2026-05-29')).toBe('29 May 2026');
    expect(formatLongDate('2026-12-05')).toBe('5 Dec 2026');
    expect(formatMonthLabel(2026, 5)).toBe('May 2026');
    expect(formatMonthLabel(2025, 12)).toBe('December 2025');
  });

  it('builds calendar facts', () => {
    expect(toIsoDate(2026, 5, 1)).toBe('2026-05-01');
    expect([daysInMonth(2026, 2), daysInMonth(2024, 2), daysInMonth(2026, 4), daysInMonth(2026, 5)]).toEqual([28, 29, 30, 31]);
    // 2026-04-01 Wed, 2026-05-01 Fri, 2026-06-01 Mon, 1970-01-01 Thu, 1969-12-29 Mon.
    expect(['2026-04-01', '2026-05-01', '2026-06-01', '1970-01-01', '1969-12-29'].map(weekdayMondayFirst)).toEqual([2, 4, 0, 3, 0]);
  });

  it('strips floating-point noise', () => {
    expect(roundHours(0.1 + 0.2)).toBe(0.3);
  });

  it('throws on an invalid date', () => {
    expect(() => toDayNumber('2026-02-30')).toThrow();
  });
});
