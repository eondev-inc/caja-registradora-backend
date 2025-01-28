import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthenticationDto {
  @ApiProperty({
    description: 'Correo-e del usuario',
    format: 'email',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    type: 'string',
  })
  @IsString()
  password: string;
}
