import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthenticationDto {
  @ApiProperty({
    description: 'Numero de rut del usuario',
    type: 'string',
  })
  @IsString()
  rut: string;

  @ApiProperty({
    description: 'Token de acceso desde em-authserver',
    type: 'email',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Token de acceso desde em-authserver',
    type: 'string',
  })
  @IsString()
  password: string;
}
