import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuthRequired, ApiValidationError } from '../../common/decorators/api-errors.decorator.js';
import { ScheduleQueryDto } from './dto/schedule-query.dto.js';
import { SchedulesResponseDto } from './dto/schedule-response.dto.js';
import { SchedulesService } from './schedules.service.js';

@ApiTags('schedules')
@ApiAuthRequired()
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  /** Schedule entries for one month, e.g. ?year=2026&month=05. */
  @Get()
  @ApiOperation({
    summary: 'Get the schedule for one month',
    description: [
      'Everything needed to draw one month of the calendar:',
      '',
      '- **monthLabel:** title, e.g. "May 2026".',
      '- **leadingBlankDays:** empty cells before day 1; the week starts on Monday.',
      '- **days:** every date of the month with its entry, or `schedule: null`.',
      '- **schedules:** the same entries as a flat list. **legend:** all duty types.',
      '',
      'The client works out the previous/next month itself and calls this endpoint again.',
      'The dataset covers April, May and June 2026; other months return all dates with `schedule: null`.',
    ].join('\n'),
  })
  @ApiOkResponse({ type: SchedulesResponseDto })
  @ApiValidationError()
  getMonth(@Query() query: ScheduleQueryDto): SchedulesResponseDto {
    return this.schedulesService.getMonth(query.year, query.month);
  }
}
