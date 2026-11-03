import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

/** Name of the security scheme referenced by @ApiBearerAuth. */
export const BEARER_AUTH_NAME = 'bearer';

export const SWAGGER_PATH = 'docs';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Susi Air Pilot App API')
    .setDescription(
      [
        'REST API for the Susi Air Pilot App.',
        '',
        '**Authentication:** call `POST /auth/login` with `johndoe` / `susiairtest`, copy the `token`,',
        'then click **Authorize** and paste it. Every endpoint except `/auth/login` and `/health` needs it.',
        '',
        '**"Today"** comes from the `APP_TODAY` environment variable (default `2026-05-15`), never from the system clock.',
        '',
        '**Errors** always use the same shape: `{ statusCode, message, error, timestamp, path }`.',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token from POST /auth/login' },
      BEARER_AUTH_NAME,
    )
    .addTag('auth', 'Sign in and get a bearer token')
    .addTag('pilot', 'Pilot profile')
    .addTag('flight-hours', 'Daily hours and the rolling-sum chart')
    .addTag('documents', 'Pilot documents and expiry status')
    .addTag('schedules', 'Monthly duty schedule')
    .addTag('health', 'Liveness check')
    .build();

  return SwaggerModule.createDocument(app, config);
}

/** Serves Swagger UI at /docs and the raw spec at /docs-json. */
export function setupSwagger(app: INestApplication): void {
  SwaggerModule.setup(SWAGGER_PATH, app, () => buildOpenApiDocument(app), {
    jsonDocumentUrl: `${SWAGGER_PATH}-json`,
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Susi Air Pilot App API',
  });
}
