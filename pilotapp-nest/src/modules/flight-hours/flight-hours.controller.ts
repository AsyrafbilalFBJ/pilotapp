import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuthRequired, ApiValidationError } from '../../common/decorators/api-errors.decorator.js';
import { FlightHoursQueryDto } from './dto/flight-hours-query.dto.js';
import { FlightHoursRangeDto, FlightHoursSummaryDto } from './dto/flight-hours-response.dto.js';
import { SummaryQueryDto } from './dto/summary-query.dto.js';
import { FlightHoursService } from './flight-hours.service.js';

@ApiTags('flight-hours')
@ApiAuthRequired()
@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  /** Daily hours for every date in [from, to]. */
  @Get()
  @ApiOperation({
    summary: 'Get daily flight hours in a date range',
    description: 'One entry per calendar day, both ends inclusive. Days with no record return 0 instead of being skipped.',
  })
  @ApiOkResponse({ type: FlightHoursRangeDto })
  @ApiValidationError()
  getDaily(@Query() query: FlightHoursQueryDto): FlightHoursRangeDto {
    return this.flightHoursService.getDailyHours(query.from, query.to);
  }

  /** Rolling-sum series for the chart plus the four limit cards. */
  @Get('summary')
  @ApiOperation({
    summary: 'Get the rolling-sum chart series and limit cards',
    description: [
      'The rolling sum is computed on the server.',
      '',
      '- **chart.series:** 15 days, today − 7 … today + 7, with today in the centre. `rollingSum` is the sum of the `windowDays` days ending on that date; `dailyHours` is that date alone.',
      '- **Missing dates** count as 0. Days before the first dataset date (2024-12-27) count as 0 and set `isPartialWindow`.',
      '- **Future dates** use the planned hours in the dataset, so they are a projection (`isFuture`). Dates after the dataset end count as 0.',
      '- **Values above the limit** are returned as they are, with `isExceeded: true`.',
      '- **cards:** daily, weekly, monthly, annual, always for the window ending today. `status` is `safe` below 70 %, `warning` from 70 %, `danger` from 90 % or when the limit is exceeded.',
      '',
      '| range | window | limitLine | yAxisMax |',
      '| --- | --- | --- | --- |',
      '| 1w | 7 days | 40 | 45 |',
      '| 1m | 30 days | 100 | 125 |',
      '| 3m | 90 days | 300 | 325 |',
      '| 6m | 180 days | 600 | 625 |',
      '| 1y | 365 days | 1050 | 1200 |',
    ].join('\n'),
  })
  @ApiOkResponse({ type: FlightHoursSummaryDto })
  @ApiValidationError()
  getSummary(@Query() query: SummaryQueryDto): FlightHoursSummaryDto {
    return this.flightHoursService.getSummary(query.range);
  }
}
