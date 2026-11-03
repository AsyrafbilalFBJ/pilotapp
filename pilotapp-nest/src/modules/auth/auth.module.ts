import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import type { EnvConfig } from '../../config/env.validation.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

/** "3600" means seconds; anything else is a duration string such as "1d". */
function toExpiresIn(value: string): StringValue | number {
  return /^\d+$/.test(value) ? Number(value) : (value as StringValue);
}

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: toExpiresIn(config.get('JWT_EXPIRES_IN', { infer: true })) },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Applies the guard to every route in the app; use @Public() to opt out.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
