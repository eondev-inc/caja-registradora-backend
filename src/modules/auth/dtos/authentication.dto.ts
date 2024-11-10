import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthenticationDto {
  @ApiProperty({
    description: 'Token de acceso desde em-authserver',
    type: 'string',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Token de acceso desde em-authserver',
    type: 'string',
  })
  @IsString()
  password: string;
}
