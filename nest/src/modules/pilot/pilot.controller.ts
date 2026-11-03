import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuthRequired } from '../../common/decorators/api-errors.decorator.js';
import { PilotProfileDto } from './dto/pilot-profile.dto.js';
import { PilotService } from './pilot.service.js';

@ApiTags('pilot')
@ApiAuthRequired()
@Controller('pilot')
export class PilotController {
  constructor(private readonly pilotService: PilotService) {}

  /** Profile of the signed-in pilot. */
  @Get('me')
  @ApiOperation({ summary: 'Get the pilot profile', description: 'Name, total flight hours and avatar URL for the Home header.' })
  @ApiOkResponse({ type: PilotProfileDto })
  getMe(): PilotProfileDto {
    return this.pilotService.getProfile();
  }
}
