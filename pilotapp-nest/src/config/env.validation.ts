import { isValidIsoDate } from '../common/utils/date.util.js';

export interface EnvConfig {
  PORT: number;
  /** The date the app treats as "today" (YYYY-MM-DD). Never derived from the system clock. */
  APP_TODAY: string;
  /** Folder holding the seed JSON files, resolved against the process working directory. */
  DATASOURCE_DIR: string;
  JWT_SECRET: string;
  /** Token lifetime: seconds (e.g. "3600") or a duration such as "15m", "12h", "1d". */
  JWT_EXPIRES_IN: string;
  /** Comma-separated list of allowed browser origins. */
  CORS_ORIGIN: string;
  /** Serve Swagger UI at /docs. */
  SWAGGER_ENABLED: boolean;
}

const DEFAULTS = {
  PORT: '3001',
  APP_TODAY: '2026-05-15',
  DATASOURCE_DIR: 'src/datasource',
  JWT_EXPIRES_IN: '1d',
  CORS_ORIGIN: 'http://localhost:3000',
  SWAGGER_ENABLED: 'true',
} as const;

const MIN_SECRET_LENGTH = 16;
const DURATION_PATTERN = /^\d+(ms|s|m|h|d|w|y)?$/;

function readString(raw: Record<string, unknown>, key: string): string | undefined {
  const value = raw[key];
  if (typeof value !== 'string' && typeof value !== 'number') {
    return undefined;
  }
  const text = String(value).trim();
  return text === '' ? undefined : text;
}

/**
 * Validates and normalizes environment variables at boot.
 * Throwing here stops the app from starting with a broken configuration.
 */
export function validateEnv(raw: Record<string, unknown>): EnvConfig {
  const errors: string[] = [];

  const portText = readString(raw, 'PORT') ?? DEFAULTS.PORT;
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    errors.push(`PORT must be an integer between 1 and 65535 (got "${portText}")`);
  }

  const today = readString(raw, 'APP_TODAY') ?? DEFAULTS.APP_TODAY;
  if (!isValidIsoDate(today)) {
    errors.push(`APP_TODAY must be a valid date in YYYY-MM-DD format (got "${today}")`);
  }

  const secret = readString(raw, 'JWT_SECRET');
  if (!secret) {
    errors.push('JWT_SECRET is required');
  } else if (secret.length < MIN_SECRET_LENGTH) {
    errors.push(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long`);
  }

  const expiresIn = readString(raw, 'JWT_EXPIRES_IN') ?? DEFAULTS.JWT_EXPIRES_IN;
  if (!DURATION_PATTERN.test(expiresIn)) {
    errors.push(
      `JWT_EXPIRES_IN must be seconds or a duration like "15m", "12h", "1d" (got "${expiresIn}")`,
    );
  }

  const swaggerText = (readString(raw, 'SWAGGER_ENABLED') ?? DEFAULTS.SWAGGER_ENABLED).toLowerCase();
  if (swaggerText !== 'true' && swaggerText !== 'false') {
    errors.push(`SWAGGER_ENABLED must be "true" or "false" (got "${swaggerText}")`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }

  return {
    PORT: port,
    APP_TODAY: today,
    DATASOURCE_DIR: readString(raw, 'DATASOURCE_DIR') ?? DEFAULTS.DATASOURCE_DIR,
    JWT_SECRET: secret as string,
    JWT_EXPIRES_IN: expiresIn,
    CORS_ORIGIN: readString(raw, 'CORS_ORIGIN') ?? DEFAULTS.CORS_ORIGIN,
    SWAGGER_ENABLED: swaggerText === 'true',
  };
}
