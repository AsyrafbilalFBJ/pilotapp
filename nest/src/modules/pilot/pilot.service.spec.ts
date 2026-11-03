import type { TestingModule } from '@nestjs/testing';
import { createCoreTestingModule } from '../../../test/create-core-module.js';
import { PilotService } from './pilot.service.js';

describe('PilotService', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await createCoreTestingModule([PilotService]);
  });

  afterAll(() => moduleRef.close());

  it('returns the profile with a ui-avatars URL built from the encoded name', () => {
    expect(moduleRef.get(PilotService).getProfile()).toEqual({
      name: 'John Doe',
      totalFlightHours: 1444.5,
      avatarUrl: 'https://ui-avatars.com/api/?name=John%20Doe',
    });
  });
});
