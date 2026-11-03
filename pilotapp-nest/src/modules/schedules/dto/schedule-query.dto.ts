import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsInt, Max, Min } from 'class-validator';

export class ScheduleQueryDto {
  @ApiProperty({ type: Number, example: 2026, minimum: 1900, maximum: 9999, description: 'Four-digit year (YYYY).' })
  @IsDefined({ message: 'year is required' })
  @Type(() => Number)
  @IsInt({ message: 'year must be an integer (YYYY)' })
  @Min(1900)
  @Max(9999)
  year: number;

  @ApiProperty({ type: Number, example: 5, minimum: 1, maximum: 12, description: 'Month 1–12. "05" and "5" are both accepted.' })
  @IsDefined({ message: 'month is required' })
  @Type(() => Number)
  @IsInt({ message: 'month must be an integer between 1 and 12' })
  @Min(1, { message: 'month must be an integer between 1 and 12' })
  @Max(12, { message: 'month must be an integer between 1 and 12' })
  month: number;
}
