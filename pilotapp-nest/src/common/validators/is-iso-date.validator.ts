import { registerDecorator, type ValidationOptions } from 'class-validator';
import { isValidIsoDate } from '../utils/date.util.js';

/** Requires a real calendar date in `YYYY-MM-DD` form (e.g. rejects 2026-02-30). */
export function IsIsoDate(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isIsoDate',
      target: target.constructor,
      propertyName: propertyName as string,
      options: {
        message: `${String(propertyName)} must be a valid date in YYYY-MM-DD format`,
        ...options,
      },
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && isValidIsoDate(value);
        },
      },
    });
  };
}
