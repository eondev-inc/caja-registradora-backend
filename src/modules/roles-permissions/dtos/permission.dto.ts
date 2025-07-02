import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * DTO para crear un nuevo permiso
 */
export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}

/**
 * DTO para actualizar un permiso existente
 */
export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
