import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { createValidationPipe } from './common/validation.js';
import { validateEnv } from './config/env.validation.js';
import { CoreModule } from './core/core.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { FlightHoursModule } from './modules/flight-hours/flight-hours.module.js';
import { PilotModule } from './modules/pilot/pilot.module.js';
import { SchedulesModule } from './modules/schedules/schedules.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    CoreModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [
    // Registered here (not in main.ts) so e2e tests get the same pipe and filter.
    { provide: APP_PIPE, useFactory: createValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
