import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre',
    type: 'string',
  })
  @IsString()
  forename: string;

  @ApiProperty({
    description: 'Apellidos',
    type: 'string',
  })
  @IsString()
  surnames: string;

  @ApiProperty({
    description: 'Correo electrónico',
    type: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña',
    type: 'string',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Confirmación de contraseña',
    type: 'string',
  })
}
