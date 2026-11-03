import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status: 'ok';

  @ApiProperty({ format: 'date', example: '2026-05-15', description: 'Value of APP_TODAY.' })
  today: string;
}
