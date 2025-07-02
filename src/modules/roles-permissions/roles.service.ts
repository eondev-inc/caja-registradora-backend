import { Injectable, NotFoundException, ConflictException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { roles as Role } from '@prisma/client';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsToRoleDto, AssignRoleToUsersDto } from './dtos/role.dto';
import { RoleResponseDto, RoleWithPermissionsResponseDto, PaginatedResponseDto, UserRolesResponseDto } from './dtos/response.dto';
import { LoggingConfigService } from '@/config/logging/logging-config.service';

@Injectable()
export class RolesService {
  private readonly logger = LoggingConfigService.getInstance().getLogger();

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new role
   * @param createRoleDto - Data to create the role
   * @returns The created role
   * @throws ConflictException if role name already exists
   * @throws InternalServerErrorException for unexpected errors
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<RoleWithPermissionsResponseDto> {
    try {
      // Check if role name already exists
      const existingRole = await this.prismaService.roles.findFirst({
        where: { 
          role_name: createRoleDto.role_name,
          status: true,
        },
      });

      if (existingRole) {
        throw new ConflictException(`Role with name '${createRoleDto.role_name}' already exists`);
      }

      // Create role and assign permissions if provided
      const role = await this.prismaService.roles.create({
        data: {
          role_name: createRoleDto.role_name,
          description: createRoleDto.description,
          status: createRoleDto.status ?? true,
        },
      });

      // Assign permissions if provided
      if (createRoleDto.permission_ids && createRoleDto.permission_ids.length > 0) {
        await this.assignPermissionsToRole(role.id, { permission_ids: createRoleDto.permission_ids });
      }

      this.logger.log('Role created successfully', {
        roleId: role.id,
        roleName: role.role_name,
        permissionsCount: createRoleDto.permission_ids?.length || 0,
      });

      return await this.getRoleWithPermissions(role.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error creating role:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        data: createRoleDto,
      });
      throw new InternalServerErrorException('Failed to create role');
    }
  }

  /**
   * Gets all roles with optional pagination
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @param includePermissions - Whether to include permissions in response
   * @returns List of roles
   */
  async getAllRoles(
    page?: number, 
    limit?: number, 
    includePermissions: boolean = false
  ): Promise<PaginatedResponseDto<RoleResponseDto | RoleWithPermissionsResponseDto> | (RoleResponseDto | RoleWithPermissionsResponseDto)[]> {
    try {
      const includeRelations = {
        role_permissions: includePermissions ? {
          where: { status: true },
          select: {
            permissions: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                created_at: true,
                updated_at: true,
              },
            },
          },
        } : false,
      };

      if (page && limit) {
        const skip = (page - 1) * limit;
        const [roles, total] = await Promise.all([
          this.prismaService.roles.findMany({
            where: { status: true },
            skip,
            take: limit,
            orderBy: { role_name: 'asc' },
            include: includeRelations,
          }),
          this.prismaService.roles.count({
            where: { status: true },
          }),
        ]);

        return {
          data: roles.map(r => includePermissions ? this.mapToRoleWithPermissionsDto(r) : this.mapToRoleDto(r)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      } else {
        const roles = await this.prismaService.roles.findMany({
          where: { status: true },
          orderBy: { role_name: 'asc' },
          include: includeRelations,
        });

        return roles.map(r => includePermissions ? this.mapToRoleWithPermissionsDto(r) : this.mapToRoleDto(r));
      }
    } catch (error) {
      this.logger.error('Unexpected error fetching roles:', {
        error: error instanceof Error ? error.message : String(error),
        page,
        limit,
        includePermissions,
      });
      throw new InternalServerErrorException('Failed to fetch roles');
    }
  }

  /**
   * Gets a role by ID with permissions
   * @param id - Role ID
   * @returns The role with permissions
   * @throws NotFoundException if role is not found
   */
  async getRoleWithPermissions(id: string): Promise<RoleWithPermissionsResponseDto> {
    try {
      const role = await this.prismaService.roles.findFirst({
        where: { 
          id,
          status: true,
        },
        include: {
          role_permissions: {
            where: { status: true },
            select: {
              permissions: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  status: true,
                  created_at: true,
                  updated_at: true,
                },
              },
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      return this.mapToRoleWithPermissionsDto(role);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching role:', {
        error: error instanceof Error ? error.message : String(error),
        roleId: id,
      });
      throw new InternalServerErrorException('Failed to fetch role');
    }
  }

  /**
   * Updates a role
   * @param id - Role ID
   * @param updateRoleDto - Data to update
   * @returns The updated role
   * @throws NotFoundException if role is not found
   * @throws ConflictException if new name already exists
   */
  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleWithPermissionsResponseDto> {
    try {
      const existingRole = await this.prismaService.roles.findFirst({
        where: { id, status: true },
      });

      if (!existingRole) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      // Check if new name conflicts with existing role
      if (updateRoleDto.role_name && updateRoleDto.role_name !== existingRole.role_name) {
        const nameConflict = await this.prismaService.roles.findFirst({
          where: { 
            role_name: updateRoleDto.role_name,
            status: true,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ConflictException(`Role with name '${updateRoleDto.role_name}' already exists`);
        }
      }

      await this.prismaService.roles.update({
        where: { id },
        data: updateRoleDto,
      });

      this.logger.log('Role updated successfully', {
        roleId: id,
        changes: updateRoleDto,
      });

      return await this.getRoleWithPermissions(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error updating role:', {
        error: error instanceof Error ? error.message : String(error),
        roleId: id,
        data: updateRoleDto,
      });
      throw new InternalServerErrorException('Failed to update role');
    }
  }

  /**
   * Assigns permissions to a role
   * @param roleId - Role ID
   * @param assignPermissionsDto - Permission IDs to assign
   * @returns Success message
   */
  async assignPermissionsToRole(roleId: string, assignPermissionsDto: AssignPermissionsToRoleDto): Promise<{ message: string }> {
    try {
      const role = await this.prismaService.roles.findFirst({
        where: { id: roleId, status: true },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      // Remove existing permissions
      await this.prismaService.role_permissions.updateMany({
        where: { role_id: roleId },
        data: { status: false },
      });

      // Add new permissions
      const rolePermissions = assignPermissionsDto.permission_ids.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId,
        status: true,
      }));

      await this.prismaService.role_permissions.createMany({
        data: rolePermissions,
      });

      this.logger.log('Permissions assigned to role successfully', {
        roleId,
        permissionsCount: assignPermissionsDto.permission_ids.length,
      });

      return { message: `${assignPermissionsDto.permission_ids.length} permissions assigned to role successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error assigning permissions to role:', {
        error: error instanceof Error ? error.message : String(error),
        roleId,
        permissions: assignPermissionsDto.permission_ids,
      });
      throw new InternalServerErrorException('Failed to assign permissions to role');
    }
  }

  /**
   * Assigns role to users
   * @param roleId - Role ID
   * @param assignRoleDto - User IDs to assign role to
   * @returns Success message
   */
  async assignRoleToUsers(roleId: string, assignRoleDto: AssignRoleToUsersDto): Promise<{ message: string }> {
    try {
      const role = await this.prismaService.roles.findFirst({
        where: { id: roleId, status: true },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      const userRoles = assignRoleDto.user_ids.map(userId => ({
        user_id: userId,
        role_id: roleId,
        status: true,
      }));

      await this.prismaService.user_roles.createMany({
        data: userRoles,
        skipDuplicates: true,
      });

      this.logger.log('Role assigned to users successfully', {
        roleId,
        usersCount: assignRoleDto.user_ids.length,
      });

      return { message: `Role assigned to ${assignRoleDto.user_ids.length} users successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error assigning role to users:', {
        error: error instanceof Error ? error.message : String(error),
        roleId,
        users: assignRoleDto.user_ids,
      });
      throw new InternalServerErrorException('Failed to assign role to users');
    }
  }

  /**
   * Gets users with their roles
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @returns List of users with roles
   */
  async getUsersWithRoles(page?: number, limit?: number): Promise<PaginatedResponseDto<UserRolesResponseDto> | UserRolesResponseDto[]> {
    try {
      if (page && limit) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
          this.prismaService.users.findMany({
            where: { status: true },
            skip,
            take: limit,
            select: {
              id: true,
              email: true,
              forenames: true,
              surnames: true,
              user_roles: {
                where: { status: true },
                select: {
                  roles: {
                    select: {
                      id: true,
                      role_name: true,
                      description: true,
                      status: true,
                      created_at: true,
                      updated_at: true,
                    },
                  },
                },
              },
            },
            orderBy: { email: 'asc' },
          }),
          this.prismaService.users.count({
            where: { status: true },
          }),
        ]);

        return {
          data: users.map(u => this.mapToUserRolesDto(u)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      } else {
        const users = await this.prismaService.users.findMany({
          where: { status: true },
          select: {
            id: true,
            email: true,
            forenames: true,
            surnames: true,
            user_roles: {
              where: { status: true },
              select: {
                roles: {
                  select: {
                    id: true,
                    role_name: true,
                    description: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                  },
                },
              },
            },
          },
          orderBy: { email: 'asc' },
        });

        return users.map(u => this.mapToUserRolesDto(u));
      }
    } catch (error) {
      this.logger.error('Unexpected error fetching users with roles:', {
        error: error instanceof Error ? error.message : String(error),
        page,
        limit,
      });
      throw new InternalServerErrorException('Failed to fetch users with roles');
    }
  }

  /**
   * Soft deletes a role (sets status to false)
   * @param id - Role ID
   * @returns Success message
   * @throws NotFoundException if role is not found
   */
  async deleteRole(id: string): Promise<{ message: string }> {
    try {
      const existingRole = await this.prismaService.roles.findFirst({
        where: { id, status: true },
      });

      if (!existingRole) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      // Soft delete role and its permissions
      await Promise.all([
        this.prismaService.roles.update({
          where: { id },
          data: { status: false },
        }),
        this.prismaService.role_permissions.updateMany({
          where: { role_id: id },
          data: { status: false },
        }),
        this.prismaService.user_roles.updateMany({
          where: { role_id: id },
          data: { status: false },
        }),
      ]);

      this.logger.log('Role deleted successfully', {
        roleId: id,
        roleName: existingRole.role_name,
      });

      return { message: `Role '${existingRole.role_name}' deleted successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error deleting role:', {
        error: error instanceof Error ? error.message : String(error),
        roleId: id,
      });
      throw new InternalServerErrorException('Failed to delete role');
    }
  }

  /**
   * Maps a Role entity to RoleResponseDto
   */
  private mapToRoleDto(role: any): RoleResponseDto {
    return {
      id: role.id,
      role_name: role.role_name,
      description: role.description,
      status: role.status,
      created_at: role.created_at,
      updated_at: role.updated_at,
    };
  }

  /**
   * Maps a Role entity with permissions to RoleWithPermissionsResponseDto
   */
  private mapToRoleWithPermissionsDto(role: any): RoleWithPermissionsResponseDto {
    return {
      id: role.id,
      role_name: role.role_name,
      description: role.description,
      status: role.status,
      created_at: role.created_at,
      updated_at: role.updated_at,
      permissions: role.role_permissions?.map(rp => rp.permissions) || [],
    };
  }

  /**
   * Maps a User entity with roles to UserRolesResponseDto
   */
  private mapToUserRolesDto(user: any): UserRolesResponseDto {
    return {
      id: user.id,
      email: user.email,
      forenames: user.forenames,
      surnames: user.surnames,
      roles: user.user_roles?.map(ur => ur.roles) || [],
    };
  }
}
