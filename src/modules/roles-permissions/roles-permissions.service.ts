import { Injectable, NotFoundException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { LoggingConfigService } from '@/config/logging/logging-config.service';
import { PermissionsService } from './permissions.service';
import { RolesService } from './roles.service';

@Injectable()
export class RolesPermissionsService {
  private readonly logger = LoggingConfigService.getInstance().getLogger();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * Checks if a user has a specific permission
   * @param userId - User ID
   * @param permissionName - Permission name to check
   * @param entityId - Entity ID (optional, for multi-tenant)
   * @returns Boolean indicating if user has the permission
   */
  async userHasPermission(userId: string, permissionName: string, entityId?: string): Promise<boolean> {
    try {
      const whereClause: any = {
        id: userId,
        status: true,
        user_roles: {
          some: {
            status: true,
            roles: {
              status: true,
              role_permissions: {
                some: {
                  status: true,
                  permissions: {
                    name: permissionName,
                    status: true,
                  },
                },
              },
            },
          },
        },
      };

      // Add entity filter if provided
      if (entityId) {
        whereClause.entity_users = {
          some: {
            entity_id: entityId,
            status: true,
          },
        };
      }

      const user = await this.prismaService.users.findFirst({
        where: whereClause,
      });

      return !!user;
    } catch (error) {
      this.logger.error('Error checking user permission:', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        permissionName,
        entityId,
      });
      return false;
    }
  }

  /**
   * Gets all permissions for a user
   * @param userId - User ID
   * @param entityId - Entity ID (optional, for multi-tenant)
   * @returns Array of permission names
   */
  async getUserPermissions(userId: string, entityId?: string): Promise<string[]> {
    try {
      const whereClause: any = {
        id: userId,
        status: true,
      };

      // Add entity filter if provided
      if (entityId) {
        whereClause.entity_users = {
          some: {
            entity_id: entityId,
            status: true,
          },
        };
      }

      const user = await this.prismaService.users.findFirst({
        where: whereClause,
        select: {
          user_roles: {
            where: { status: true },
            select: {
              roles: {
                select: {
                  role_permissions: {
                    where: { status: true },
                    select: {
                      permissions: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Extract unique permission names
      const permissions = new Set<string>();
      
      user.user_roles.forEach(userRole => {
        userRole.roles.role_permissions.forEach(rolePermission => {
          permissions.add(rolePermission.permissions.name);
        });
      });

      return Array.from(permissions);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error getting user permissions:', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        entityId,
      });
      throw new InternalServerErrorException('Failed to get user permissions');
    }
  }

  /**
   * Gets all roles for a user
   * @param userId - User ID
   * @param entityId - Entity ID (optional, for multi-tenant)
   * @returns Array of role names
   */
  async getUserRoles(userId: string, entityId?: string): Promise<string[]> {
    try {
      const whereClause: any = {
        id: userId,
        status: true,
      };

      // Add entity filter if provided
      if (entityId) {
        whereClause.entity_users = {
          some: {
            entity_id: entityId,
            status: true,
          },
        };
      }

      const user = await this.prismaService.users.findFirst({
        where: whereClause,
        select: {
          user_roles: {
            where: { status: true },
            select: {
              roles: {
                select: {
                  role_name: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return user.user_roles.map(userRole => userRole.roles.role_name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error getting user roles:', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        entityId,
      });
      throw new InternalServerErrorException('Failed to get user roles');
    }
  }

  /**
   * Removes a role from a user
   * @param userId - User ID
   * @param roleId - Role ID
   * @returns Success message
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<{ message: string }> {
    try {
      const userRole = await this.prismaService.user_roles.findFirst({
        where: {
          user_id: userId,
          role_id: roleId,
          status: true,
        },
      });

      if (!userRole) {
        throw new NotFoundException(`User role assignment not found`);
      }

      await this.prismaService.user_roles.update({
        where: { id: userRole.id },
        data: { status: false },
      });

      this.logger.log('Role removed from user successfully', {
        userId,
        roleId,
      });

      return { message: 'Role removed from user successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error removing role from user:', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        roleId,
      });
      throw new InternalServerErrorException('Failed to remove role from user');
    }
  }

  /**
   * Assigns a single role to a user
   * @param userId - User ID
   * @param roleId - Role ID
   * @returns Success message
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<{ message: string }> {
    try {
      // Check if user exists
      const user = await this.prismaService.users.findFirst({
        where: { id: userId, status: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if role exists
      const role = await this.prismaService.roles.findFirst({
        where: { id: roleId, status: true },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      // Check if assignment already exists
      const existingAssignment = await this.prismaService.user_roles.findFirst({
        where: {
          user_id: userId,
          role_id: roleId,
        },
      });

      if (existingAssignment) {
        if (existingAssignment.status) {
          return { message: 'Role already assigned to user' };
        } else {
          // Reactivate the assignment
          await this.prismaService.user_roles.update({
            where: { id: existingAssignment.id },
            data: { status: true },
          });
        }
      } else {
        // Create new assignment
        await this.prismaService.user_roles.create({
          data: {
            user_id: userId,
            role_id: roleId,
            status: true,
          },
        });
      }

      this.logger.log('Role assigned to user successfully', {
        userId,
        roleId,
        roleName: role.role_name,
      });

      return { message: `Role '${role.role_name}' assigned to user successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error assigning role to user:', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        roleId,
      });
      throw new InternalServerErrorException('Failed to assign role to user');
    }
  }
}
