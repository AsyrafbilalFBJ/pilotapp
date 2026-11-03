/**
 * Calendar-date helpers that work on `YYYY-MM-DD` strings in UTC.
 *
 * Dates are converted to an integer "day number" (days since the Unix epoch)
 * so that day arithmetic is exact and unaffected by local time zones or DST.
 * None of these helpers read the system clock; "today" comes from TimeService.
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

function splitIsoDate(value: string): [number, number, number] {
  const [year, month, day] = value.split('-').map(Number);
  return [year, month, day];
}

/** True when `value` is a real calendar date in `YYYY-MM-DD` form (e.g. rejects 2026-02-30). */
export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const [year, month, day] = splitIsoDate(value);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/** Converts `YYYY-MM-DD` to days since 1970-01-01. Throws on an invalid date. */
export function toDayNumber(value: string): number {
  if (!isValidIsoDate(value)) {
    throw new Error(`Invalid ISO date: "${value}"`);
  }
  const [year, month, day] = splitIsoDate(value);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

/** Converts a day number back to `YYYY-MM-DD`. */
export function fromDayNumber(dayNumber: number): string {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Returns the date `days` days after `value` (negative values go back in time). */
export function addDays(value: string, days: number): string {
  return fromDayNumber(toDayNumber(value) + days);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffDays(to: string, from: string): number {
  return toDayNumber(to) - toDayNumber(from);
}

/** Builds `YYYY-MM-DD` from numeric parts (month is 1–12). */
export function toIsoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Number of days in a month (month is 1–12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Day of the week with Monday = 0 … Sunday = 6. Day number 0 (1970-01-01) was a Thursday. */
export function weekdayMondayFirst(value: string): number {
  return (((toDayNumber(value) + 3) % 7) + 7) % 7;
}

// Fixed English names so output never depends on the server locale.
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const LONG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
const SHORT_WEEKDAYS_MONDAY_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function dateParts(value: string): [number, number, number] {
  return splitIsoDate(fromDayNumber(toDayNumber(value)));
}

/** "8 May" (chart labels). */
export function formatShortDate(value: string): string {
  const [, month, day] = dateParts(value);
  return `${day} ${SHORT_MONTHS[month - 1]}`;
}

/** "Fri, 15 May" (Logbook rows). */
export function formatWeekdayDate(value: string): string {
  return `${SHORT_WEEKDAYS_MONDAY_FIRST[weekdayMondayFirst(value)]}, ${formatShortDate(value)}`;
}

/** "29 May 2026" (document expiry dates). */
export function formatLongDate(value: string): string {
  const [year] = dateParts(value);
  return `${formatShortDate(value)} ${year}`;
}

/** "May 2026" (calendar title). Month is 1–12. */
export function formatMonthLabel(year: number, month: number): string {
  return `${LONG_MONTHS[month - 1]} ${year}`;
}

/** Rounds to 2 decimals to strip floating-point noise from summed hours. */
export function roundHours(value: number): number {
  return Math.round(value * 100) / 100;
}
