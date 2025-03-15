import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthenticationDto {
  @ApiProperty({
    description: 'Correo-e del usuario',
    format: 'email',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    type: 'string',
  })
  @IsString()
  password: string;
}
