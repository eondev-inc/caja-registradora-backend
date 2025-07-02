/**
 * DTO de respuesta para permisos
 */
export class PermissionResponseDto {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO de respuesta para roles con permisos
 */
export class RoleWithPermissionsResponseDto {
  id: string;
  role_name: string;
  description?: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
  permissions: PermissionResponseDto[];
}

/**
 * DTO de respuesta para rol básico
 */
export class RoleResponseDto {
  id: string;
  role_name: string;
  description?: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO de respuesta para usuario con roles
 */
export class UserRolesResponseDto {
  id: string;
  email: string;
  forenames?: string;
  surnames?: string;
  roles: RoleResponseDto[];
}

/**
 * DTO de respuesta para listado paginado
 */
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
