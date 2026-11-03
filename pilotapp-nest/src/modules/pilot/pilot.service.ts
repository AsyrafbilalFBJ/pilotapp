import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../../core/data-store.service.js';
import type { PilotProfileDto } from './dto/pilot-profile.dto.js';

const AVATAR_BASE_URL = 'https://ui-avatars.com/api/';

@Injectable()
export class PilotService {
  constructor(private readonly dataStore: DataStoreService) {}

  getProfile(): PilotProfileDto {
    const { name, totalFlightHours } = this.dataStore.getPilot();
    return {
      name,
      totalFlightHours,
      avatarUrl: `${AVATAR_BASE_URL}?name=${encodeURIComponent(name)}`,
    };
  }
}
