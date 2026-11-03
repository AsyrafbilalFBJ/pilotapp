import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsIsoDate } from '../../../common/validators/is-iso-date.validator.js';

export class FlightHoursQueryDto {
  @ApiProperty({ format: 'date', example: '2026-05-01', description: 'First day, inclusive (YYYY-MM-DD).' })
  @IsDefined({ message: 'from is required' })
  @IsIsoDate()
  from: string;

  @ApiProperty({
    format: 'date',
    example: '2026-05-15',
    description: 'Last day, inclusive (YYYY-MM-DD). Must be on or after `from`; the range can be at most 731 days.',
  })
  @IsDefined({ message: 'to is required' })
  @IsIsoDate()
  to: string;
}
