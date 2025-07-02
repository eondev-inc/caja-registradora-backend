import { Injectable, NotFoundException, ConflictException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { permmisions as Permission } from '@prisma/client';
import { CreatePermissionDto, UpdatePermissionDto } from './dtos/permission.dto';
import { PermissionResponseDto, PaginatedResponseDto } from './dtos/response.dto';
import { LoggingConfigService } from '@/config/logging/logging-config.service';

@Injectable()
export class PermissionsService {
  private readonly logger = LoggingConfigService.getInstance().getLogger();

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new permission
   * @param createPermissionDto - Data to create the permission
   * @returns The created permission
   * @throws ConflictException if permission name already exists
   * @throws InternalServerErrorException for unexpected errors
   */
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    try {
      // Check if permission name already exists
      const existingPermission = await this.prismaService.permmisions.findFirst({
        where: { 
          name: createPermissionDto.name,
          status: true,
        },
      });

      if (existingPermission) {
        throw new ConflictException(`Permission with name '${createPermissionDto.name}' already exists`);
      }

      const permission = await this.prismaService.permmisions.create({
        data: createPermissionDto,
      });

      this.logger.log('Permission created successfully', {
        permissionId: permission.id,
        name: permission.name,
      });

      return this.mapToResponseDto(permission);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error creating permission:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        data: createPermissionDto,
      });
      throw new InternalServerErrorException('Failed to create permission');
    }
  }

  /**
   * Gets all permissions with optional pagination
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @returns List of permissions
   */
  async getAllPermissions(page?: number, limit?: number): Promise<PaginatedResponseDto<PermissionResponseDto> | PermissionResponseDto[]> {
    try {
      if (page && limit) {
        const skip = (page - 1) * limit;
        const [permissions, total] = await Promise.all([
          this.prismaService.permmisions.findMany({
            where: { status: true },
            skip,
            take: limit,
            orderBy: { name: 'asc' },
          }),
          this.prismaService.permmisions.count({
            where: { status: true },
          }),
        ]);

        return {
          data: permissions.map(p => this.mapToResponseDto(p)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      } else {
        const permissions = await this.prismaService.permmisions.findMany({
          where: { status: true },
          orderBy: { name: 'asc' },
        });

        return permissions.map(p => this.mapToResponseDto(p));
      }
    } catch (error) {
      this.logger.error('Unexpected error fetching permissions:', {
        error: error instanceof Error ? error.message : String(error),
        page,
        limit,
      });
      throw new InternalServerErrorException('Failed to fetch permissions');
    }
  }

  /**
   * Gets a permission by ID
   * @param id - Permission ID
   * @returns The permission
   * @throws NotFoundException if permission is not found
   */
  async getPermissionById(id: string): Promise<PermissionResponseDto> {
    try {
      const permission = await this.prismaService.permmisions.findFirst({
        where: { 
          id,
          status: true,
        },
      });

      if (!permission) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      return this.mapToResponseDto(permission);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching permission:', {
        error: error instanceof Error ? error.message : String(error),
        permissionId: id,
      });
      throw new InternalServerErrorException('Failed to fetch permission');
    }
  }

  /**
   * Updates a permission
   * @param id - Permission ID
   * @param updatePermissionDto - Data to update
   * @returns The updated permission
   * @throws NotFoundException if permission is not found
   * @throws ConflictException if new name already exists
   */
  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    try {
      // Check if permission exists
      const existingPermission = await this.prismaService.permmisions.findFirst({
        where: { id, status: true },
      });

      if (!existingPermission) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      // Check if new name conflicts with existing permission
      if (updatePermissionDto.name && updatePermissionDto.name !== existingPermission.name) {
        const nameConflict = await this.prismaService.permmisions.findFirst({
          where: { 
            name: updatePermissionDto.name,
            status: true,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ConflictException(`Permission with name '${updatePermissionDto.name}' already exists`);
        }
      }

      const updatedPermission = await this.prismaService.permmisions.update({
        where: { id },
        data: updatePermissionDto,
      });

      this.logger.log('Permission updated successfully', {
        permissionId: id,
        changes: updatePermissionDto,
      });

      return this.mapToResponseDto(updatedPermission);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error updating permission:', {
        error: error instanceof Error ? error.message : String(error),
        permissionId: id,
        data: updatePermissionDto,
      });
      throw new InternalServerErrorException('Failed to update permission');
    }
  }

  /**
   * Soft deletes a permission (sets status to false)
   * @param id - Permission ID
   * @returns Success message
   * @throws NotFoundException if permission is not found
   */
  async deletePermission(id: string): Promise<{ message: string }> {
    try {
      const existingPermission = await this.prismaService.permmisions.findFirst({
        where: { id, status: true },
      });

      if (!existingPermission) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      await this.prismaService.permmisions.update({
        where: { id },
        data: { status: false },
      });

      this.logger.log('Permission deleted successfully', {
        permissionId: id,
        name: existingPermission.name,
      });

      return { message: `Permission '${existingPermission.name}' deleted successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error deleting permission:', {
        error: error instanceof Error ? error.message : String(error),
        permissionId: id,
      });
      throw new InternalServerErrorException('Failed to delete permission');
    }
  }

  /**
   * Maps a Permission entity to a PermissionResponseDto
   * @param permission - The permission entity
   * @returns Formatted permission DTO
   */
  private mapToResponseDto(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      status: permission.status,
      created_at: permission.created_at,
      updated_at: permission.updated_at,
    };
  }
}
