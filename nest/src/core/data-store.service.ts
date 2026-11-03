import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isValidIsoDate, toDayNumber } from '../common/utils/date.util.js';
import type { EnvConfig } from '../config/env.validation.js';
import {
  SUMMARY_RANGES,
  type ChartBound,
  type DocumentRecord,
  type DocumentsFile,
  type DutyLimits,
  type FlightHourRecord,
  type FlightHoursFile,
  type LegendRecord,
  type PilotRecord,
  type ScheduleRecord,
  type SchedulesFile,
  type SummaryRange,
} from './types/datasource.types.js';

const FILES = {
  flightHours: 'mock-flight-hours.json',
  documents: 'mock-documents.json',
  schedules: 'mock-schedules.json',
} as const;

/** Thrown when a seed file is missing fields or has values of the wrong type. */
class DatasourceError extends Error {
  constructor(file: string, detail: string) {
    super(`Invalid datasource file "${file}": ${detail}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Loads the three seed JSON files once at boot and keeps them in memory.
 * Every feature service reads from here; nothing is written back.
 */
@Injectable()
export class DataStoreService implements OnModuleInit {
  private readonly logger = new Logger(DataStoreService.name);
  private readonly datasourceDir: string;

  private pilot!: PilotRecord;
  private limits!: DutyLimits;
  private chartBounds!: Record<SummaryRange, ChartBound>;
  private flightHours: FlightHourRecord[] = [];
  /** Day number → hours, for O(1) lookups while computing rolling sums. */
  private hoursByDay = new Map<number, number>();
  private warningDays!: number;
  private documents: DocumentRecord[] = [];
  private legend: LegendRecord[] = [];
  private schedules: ScheduleRecord[] = [];

  constructor(config: ConfigService<EnvConfig, true>) {
    this.datasourceDir = resolve(process.cwd(), config.get('DATASOURCE_DIR', { infer: true }));
  }

  async onModuleInit(): Promise<void> {
    const [flightHoursRaw, documentsRaw, schedulesRaw] = await Promise.all([
      this.readJson(FILES.flightHours),
      this.readJson(FILES.documents),
      this.readJson(FILES.schedules),
    ]);

    this.applyFlightHours(this.parseFlightHours(flightHoursRaw));
    this.applyDocuments(this.parseDocuments(documentsRaw));
    this.applySchedules(this.parseSchedules(schedulesRaw));

    this.logger.log(
      `Seeded from ${this.datasourceDir}: ${this.flightHours.length} flight-hour days, ` +
        `${this.documents.length} documents, ${this.schedules.length} schedules, ` +
        `${this.legend.length} legend entries`,
    );
  }

  getPilot(): PilotRecord {
    return this.pilot;
  }

  getLimits(): DutyLimits {
    return this.limits;
  }

  getChartBound(range: SummaryRange): ChartBound {
    return this.chartBounds[range];
  }

  /** All flight-hour records sorted by date (ascending). */
  getFlightHours(): readonly FlightHourRecord[] {
    return this.flightHours;
  }

  /** Hours flown on a day number; 0 when the date is not in the dataset. */
  getHoursOnDay(dayNumber: number): number {
    return this.hoursByDay.get(dayNumber) ?? 0;
  }

  getWarningDays(): number {
    return this.warningDays;
  }

  getDocuments(): readonly DocumentRecord[] {
    return this.documents;
  }

  getLegend(): readonly LegendRecord[] {
    return this.legend;
  }

  /** All schedule records sorted by date (ascending). */
  getSchedules(): readonly ScheduleRecord[] {
    return this.schedules;
  }

  private async readJson(fileName: string): Promise<unknown> {
    const filePath = resolve(this.datasourceDir, fileName);
    let text: string;
    try {
      text = await readFile(filePath, 'utf8');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Cannot read datasource file "${filePath}". Check DATASOURCE_DIR. (${reason})`,
      );
    }
    try {
      return JSON.parse(text) as unknown;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new DatasourceError(fileName, `not valid JSON (${reason})`);
    }
  }

  private parseFlightHours(raw: unknown): FlightHoursFile {
    const file = FILES.flightHours;
    if (!isRecord(raw)) {
      throw new DatasourceError(file, 'root must be an object');
    }

    const { pilot, limits, chartBounds, flightHours } = raw;
    if (!isRecord(pilot) || !isNonEmptyString(pilot.name) || !isFiniteNumber(pilot.totalFlightHours)) {
      throw new DatasourceError(file, '"pilot" must have a name and a numeric totalFlightHours');
    }

    if (!isRecord(limits)) {
      throw new DatasourceError(file, '"limits" must be an object');
    }
    for (const key of ['daily', 'weekly', 'monthly', 'annual'] as const) {
      if (!isFiniteNumber(limits[key])) {
        throw new DatasourceError(file, `"limits.${key}" must be a number`);
      }
    }

    if (!isRecord(chartBounds)) {
      throw new DatasourceError(file, '"chartBounds" must be an object');
    }
    for (const range of SUMMARY_RANGES) {
      const bound = chartBounds[range];
      if (
        !isRecord(bound) ||
        !isFiniteNumber(bound.limit) ||
        !isFiniteNumber(bound.max) ||
        !isFiniteNumber(bound.windowDays) ||
        !isFiniteNumber(bound.displayRangeDays) ||
        !Number.isInteger(bound.windowDays) ||
        bound.windowDays < 1 ||
        !Number.isInteger(bound.displayRangeDays) ||
        bound.displayRangeDays < 0
      ) {
        throw new DatasourceError(
          file,
          `"chartBounds.${range}" must have numeric limit, max, windowDays (>= 1) and displayRangeDays (>= 0)`,
        );
      }
    }

    if (!Array.isArray(flightHours)) {
      throw new DatasourceError(file, '"flightHours" must be an array');
    }
    flightHours.forEach((entry: unknown, index) => {
      if (
        !isRecord(entry) ||
        typeof entry.date !== 'string' ||
        !isValidIsoDate(entry.date) ||
        !isFiniteNumber(entry.hours) ||
        entry.hours < 0
      ) {
        throw new DatasourceError(
          file,
          `"flightHours[${index}]" must have a YYYY-MM-DD date and non-negative hours`,
        );
      }
    });

    return raw as unknown as FlightHoursFile;
  }

  private parseDocuments(raw: unknown): DocumentsFile {
    const file = FILES.documents;
    if (!isRecord(raw)) {
      throw new DatasourceError(file, 'root must be an object');
    }

    const { thresholds, documents } = raw;
    if (
      !isRecord(thresholds) ||
      !isFiniteNumber(thresholds.warningDays) ||
      !Number.isInteger(thresholds.warningDays) ||
      thresholds.warningDays < 0
    ) {
      throw new DatasourceError(file, '"thresholds.warningDays" must be a non-negative integer');
    }

    if (!Array.isArray(documents)) {
      throw new DatasourceError(file, '"documents" must be an array');
    }
    documents.forEach((entry: unknown, index) => {
      if (
        !isRecord(entry) ||
        !isNonEmptyString(entry.id) ||
        !isNonEmptyString(entry.label) ||
        typeof entry.expiryDate !== 'string' ||
        !isValidIsoDate(entry.expiryDate)
      ) {
        throw new DatasourceError(
          file,
          `"documents[${index}]" must have id, label and a YYYY-MM-DD expiryDate`,
        );
      }
    });

    return raw as unknown as DocumentsFile;
  }

  private parseSchedules(raw: unknown): SchedulesFile {
    const file = FILES.schedules;
    if (!isRecord(raw)) {
      throw new DatasourceError(file, 'root must be an object');
    }

    const { legend, schedules } = raw;
    if (!Array.isArray(legend)) {
      throw new DatasourceError(file, '"legend" must be an array');
    }
    legend.forEach((entry: unknown, index) => {
      if (
        !isRecord(entry) ||
        !isNonEmptyString(entry.code) ||
        !isNonEmptyString(entry.label) ||
        !isNonEmptyString(entry.color)
      ) {
        throw new DatasourceError(file, `"legend[${index}]" must have code, label and color`);
      }
    });

    if (!Array.isArray(schedules)) {
      throw new DatasourceError(file, '"schedules" must be an array');
    }
    schedules.forEach((entry: unknown, index) => {
      if (
        !isRecord(entry) ||
        !isNonEmptyString(entry.id) ||
        typeof entry.duty_date !== 'string' ||
        !isValidIsoDate(entry.duty_date) ||
        (entry.status !== 1 && entry.status !== 2) ||
        !isNonEmptyString(entry.base_name) ||
        !isNonEmptyString(entry.base_color) ||
        !isNonEmptyString(entry.duty_type) ||
        !isFiniteNumber(entry.count_schedules) ||
        !isFiniteNumber(entry.count_logbooks)
      ) {
        throw new DatasourceError(
          file,
          `"schedules[${index}]" is missing a field or has a value of the wrong type`,
        );
      }
    });

    return raw as unknown as SchedulesFile;
  }

  private applyFlightHours(data: FlightHoursFile): void {
    this.pilot = { name: data.pilot.name, totalFlightHours: data.pilot.totalFlightHours };
    this.limits = { ...data.limits };
    this.chartBounds = Object.fromEntries(
      SUMMARY_RANGES.map((range) => [range, { ...data.chartBounds[range] }]),
    ) as Record<SummaryRange, ChartBound>;

    this.flightHours = data.flightHours
      .map(({ date, hours }) => ({ date, hours }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Duplicate dates are summed so no logged hours are lost.
    this.hoursByDay = new Map();
    for (const { date, hours } of this.flightHours) {
      const day = toDayNumber(date);
      this.hoursByDay.set(day, (this.hoursByDay.get(day) ?? 0) + hours);
    }
  }

  private applyDocuments(data: DocumentsFile): void {
    this.warningDays = data.thresholds.warningDays;
    this.documents = data.documents.map(({ id, label, expiryDate }) => ({ id, label, expiryDate }));
  }

  private applySchedules(data: SchedulesFile): void {
    this.legend = data.legend.map(({ code, label, color }) => ({ code, label, color }));
    this.schedules = data.schedules
      .map((entry) => ({
        id: entry.id,
        duty_date: entry.duty_date,
        status: entry.status,
        base_name: entry.base_name,
        base_color: entry.base_color,
        duty_type: entry.duty_type,
        count_schedules: entry.count_schedules,
        count_logbooks: entry.count_logbooks,
      }))
      .sort((a, b) => a.duty_date.localeCompare(b.duty_date));
  }
}
