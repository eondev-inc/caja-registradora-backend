import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'National ID' })
  @IsString()
  nid: string;

  @ApiProperty({ description: 'User surnames' })
  @IsString()
  surnames: string;

  @ApiProperty({ description: 'User forenames' })
  @IsString()
  forenames: string;

  @ApiProperty({ description: 'User Entity' })
  @IsString()
  entity_id: string;
}
