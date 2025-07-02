import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesPermissionsService } from '../roles-permissions.service';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for an endpoint
 * @param permissions - Array of required permission names
 */
export const RequirePermissions = (...permissions: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor.value);
  };
};

/**
 * Guard to check if user has required permissions
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesPermissionsService: RolesPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming user is set by authentication guard
    const entityId = request.headers['x-entity-id'] || request.query.entityId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has all required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await this.rolesPermissionsService.userHasPermission(
        user.id,
        permission,
        entityId,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `User does not have the required permission: ${permission}`,
        );
      }
    }

    return true;
  }
}
