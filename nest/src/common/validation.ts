import { ValidationPipe } from '@nestjs/common';

/**
 * Global validation settings, shared by main.ts and the e2e tests so both
 * run with the same rules.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
}
