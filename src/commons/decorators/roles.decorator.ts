import { SetMetadata } from '@nestjs/common';
import { RolesAutentia } from '@/modules/auth/enum/autentia-rol.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesAutentia[]) => SetMetadata(ROLES_KEY, roles);
