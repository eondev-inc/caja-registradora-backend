import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'nestjs-prisma';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesAutentia } from '@/modules/auth/enum/autentia-rol.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RolesAutentia[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    const userRoles = await this.prismaService.user_roles.findMany({
      where: { user_id: user.id, status: true },
      include: { roles: true },
    });

    const roleNames = userRoles.map((ur) => ur.roles.role_name);
    const hasRole = requiredRoles.some((r) => roleNames.includes(r));

    if (!hasRole) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción');
    }

    // Attach roles to request.user for downstream use
    request.user.roleNames = roleNames;
    return true;
  }
}
