import { ApiProperty } from '@nestjs/swagger';
import type { ErrorResponse } from '../filters/http-exception.filter.js';

/** Swagger description of the global error shape produced by HttpExceptionFilter. */
export class ErrorResponseDto implements ErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'A single message, or a list of messages for validation errors.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: ['from must be a valid date in YYYY-MM-DD format'],
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ format: 'date-time', example: '2026-05-15T08:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/flight-hours?from=2026-02-30&to=2026-03-01' })
  path: string;
}
