import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { EnvConfig } from './config/env.validation.js';
import { SWAGGER_PATH, setupSwagger } from './swagger.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<EnvConfig, true>>(ConfigService);

  const origins = config
    .get('CORS_ORIGIN', { infer: true })
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.enableShutdownHooks();

  const swaggerEnabled = config.get('SWAGGER_ENABLED', { infer: true });
  if (swaggerEnabled) {
    setupSwagger(app);
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(
    `API listening on http://localhost:${port} (today = ${config.get('APP_TODAY', { infer: true })})`,
    'Bootstrap',
  );
  if (swaggerEnabled) {
    Logger.log(`Swagger UI at http://localhost:${port}/${SWAGGER_PATH}`, 'Bootstrap');
  }
}

await bootstrap();
