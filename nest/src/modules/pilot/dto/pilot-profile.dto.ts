import { ApiProperty } from '@nestjs/swagger';

export class PilotProfileDto {
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 1444.5, description: 'Career total flight hours.' })
  totalFlightHours: number;

  @ApiProperty({
    example: 'https://ui-avatars.com/api/?name=John%20Doe',
    description: 'ui-avatars URL built from the pilot name.',
  })
  avatarUrl: string;
}
