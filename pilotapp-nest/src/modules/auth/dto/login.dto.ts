import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'johndoe', maxLength: 100 })
  @IsString({ message: 'username must be a string' })
  @IsNotEmpty({ message: 'username is required' })
  @MaxLength(100)
  username: string;

  @ApiProperty({ example: 'susiairtest', maxLength: 200, format: 'password' })
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password is required' })
  @MaxLength(200)
  password: string;
}
