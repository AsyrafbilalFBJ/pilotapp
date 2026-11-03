import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { SUMMARY_RANGES, type SummaryRange } from '../../../core/types/datasource.types.js';

export class SummaryQueryDto {
  @ApiPropertyOptional({
    enum: SUMMARY_RANGES,
    default: '1w',
    description: 'Chart toggle. Picks the rolling window, the red limit line and the Y-axis max.',
  })
  @IsOptional()
  @IsIn(SUMMARY_RANGES, { message: `range must be one of: ${SUMMARY_RANGES.join(', ')}` })
  range: SummaryRange = '1w';
}
