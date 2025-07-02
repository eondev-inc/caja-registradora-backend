import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength, IsArray, IsUUID } from 'class-validator';

/**
 * DTO para crear un nuevo rol
 */
export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  role_name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean = true;

  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  permission_ids?: string[];
}

/**
 * DTO para actualizar un rol existente
 */
export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  role_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

/**
 * DTO para asignar permisos a un rol
 */
export class AssignPermissionsToRoleDto {
  @IsArray()
  @IsUUID('all', { each: true })
  permission_ids: string[];
}

/**
 * DTO para asignar rol a usuarios
 */
export class AssignRoleToUsersDto {
  @IsArray()
  @IsUUID('all', { each: true })
  user_ids: string[];
}
