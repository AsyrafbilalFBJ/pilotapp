import type { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { validateEnv } from '../src/config/env.validation.js';
import { CoreModule } from '../src/core/core.module.js';
import { TimeService } from '../src/core/time.service.js';

/**
 * Builds a module with the real config and the real seed data loaded.
 * Pass `today` to pretend the app runs on a different date.
 */
export async function createCoreTestingModule(
  providers: Provider[],
  today?: string,
): Promise<TestingModule> {
  let builder = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnv }),
      CoreModule,
    ],
    providers,
  });
  if (today) {
    builder = builder.overrideProvider(TimeService).useValue({ getToday: () => today });
  }
  const moduleRef = await builder.compile();
  await moduleRef.init();
  return moduleRef;
}
