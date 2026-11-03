import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator.js';
import { HealthResponseDto } from './common/dto/health-response.dto.js';
import { TimeService } from './core/time.service.js';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly time: TimeService) {}

  /** Liveness check. Public so it can be probed without a token. */
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Liveness check', description: 'No token needed.' })
  @ApiOkResponse({ type: HealthResponseDto })
  health(): HealthResponseDto {
    return { status: 'ok', today: this.time.getToday() };
  }
}
