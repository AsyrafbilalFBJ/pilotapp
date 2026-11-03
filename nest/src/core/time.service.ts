import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../config/env.validation.js';

/**
 * Single source of truth for "today".
 * The value comes from APP_TODAY so the app behaves the same on every run;
 * it never reads the system clock.
 */
@Injectable()
export class TimeService {
  private readonly today: string;

  constructor(config: ConfigService<EnvConfig, true>) {
    this.today = config.get('APP_TODAY', { infer: true });
  }

  /** Today as `YYYY-MM-DD`. */
  getToday(): string {
    return this.today;
  }
}
