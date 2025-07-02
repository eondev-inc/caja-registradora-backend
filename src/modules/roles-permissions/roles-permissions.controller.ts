import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { RolesPermissionsService } from './roles-permissions.service';
import { PermissionsService } from './permissions.service';
import { RolesService } from './roles.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dtos/permission.dto';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsToRoleDto, AssignRoleToUsersDto } from './dtos/role.dto';

@Controller('roles-permissions')
export class RolesPermissionsController {
  constructor(
    private readonly rolesPermissionsService: RolesPermissionsService,
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
  ) {}

  // ==================== PERMISSIONS ENDPOINTS ====================

  /**
   * Create a new permission
   */
  @Post('permissions')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionsService.createPermission(createPermissionDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Permission created successfully',
      data: permission,
    };
  }

  /**
   * Get all permissions with optional pagination
   */
  @Get('permissions')
  async getAllPermissions(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const permissions = await this.permissionsService.getAllPermissions(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permissions retrieved successfully',
      data: permissions,
    };
  }

  /**
   * Get permission by ID
   */
  @Get('permissions/:id')
  async getPermissionById(@Param('id', ParseUUIDPipe) id: string) {
    const permission = await this.permissionsService.getPermissionById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permission retrieved successfully',
      data: permission,
    };
  }

  /**
   * Update a permission
   */
  @Put('permissions/:id')
  async updatePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.updatePermission(id, updatePermissionDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permission updated successfully',
      data: permission,
    };
  }

  /**
   * Delete a permission (soft delete)
   */
  @Delete('permissions/:id')
  async deletePermission(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.permissionsService.deletePermission(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  // ==================== ROLES ENDPOINTS ====================

  /**
   * Create a new role
   */
  @Post('roles')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.createRole(createRoleDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Role created successfully',
      data: role,
    };
  }

  /**
   * Get all roles with optional pagination and permissions
   */
  @Get('roles')
  async getAllRoles(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('includePermissions', new ParseBoolPipe({ optional: true })) includePermissions?: boolean,
  ) {
    const roles = await this.rolesService.getAllRoles(page, limit, includePermissions);
    return {
      statusCode: HttpStatus.OK,
      message: 'Roles retrieved successfully',
      data: roles,
    };
  }

  /**
   * Get role by ID with permissions
   */
  @Get('roles/:id')
  async getRoleWithPermissions(@Param('id', ParseUUIDPipe) id: string) {
    const role = await this.rolesService.getRoleWithPermissions(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Role retrieved successfully',
      data: role,
    };
  }

  /**
   * Update a role
   */
  @Put('roles/:id')
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.updateRole(id, updateRoleDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Role updated successfully',
      data: role,
    };
  }

  /**
   * Delete a role (soft delete)
   */
  @Delete('roles/:id')
  async deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.rolesService.deleteRole(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  /**
   * Assign permissions to a role
   */
  @Post('roles/:roleId/permissions')
  async assignPermissionsToRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() assignPermissionsDto: AssignPermissionsToRoleDto,
  ) {
    const result = await this.rolesService.assignPermissionsToRole(roleId, assignPermissionsDto);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  /**
   * Assign role to users
   */
  @Post('roles/:roleId/users')
  async assignRoleToUsers(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() assignRoleDto: AssignRoleToUsersDto,
  ) {
    const result = await this.rolesService.assignRoleToUsers(roleId, assignRoleDto);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  // ==================== USER-ROLE MANAGEMENT ENDPOINTS ====================

  /**
   * Get users with their roles
   */
  @Get('users')
  async getUsersWithRoles(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const users = await this.rolesService.getUsersWithRoles(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users with roles retrieved successfully',
      data: users,
    };
  }

  /**
   * Get user permissions
   */
  @Get('users/:userId/permissions')
  async getUserPermissions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('entityId', ParseUUIDPipe) entityId?: string,
  ) {
    const permissions = await this.rolesPermissionsService.getUserPermissions(userId, entityId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User permissions retrieved successfully',
      data: { permissions },
    };
  }

  /**
   * Get user roles
   */
  @Get('users/:userId/roles')
  async getUserRoles(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('entityId', ParseUUIDPipe) entityId?: string,
  ) {
    const roles = await this.rolesPermissionsService.getUserRoles(userId, entityId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User roles retrieved successfully',
      data: { roles },
    };
  }

  /**
   * Check if user has permission
   */
  @Get('users/:userId/has-permission/:permissionName')
  async userHasPermission(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('permissionName') permissionName: string,
    @Query('entityId', ParseUUIDPipe) entityId?: string,
  ) {
    const hasPermission = await this.rolesPermissionsService.userHasPermission(userId, permissionName, entityId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permission check completed',
      data: { hasPermission },
    };
  }

  /**
   * Assign role to user
   */
  @Post('users/:userId/roles/:roleId')
  async assignRoleToUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    const result = await this.rolesPermissionsService.assignRoleToUser(userId, roleId);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  /**
   * Remove role from user
   */
  @Delete('users/:userId/roles/:roleId')
  async removeRoleFromUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    const result = await this.rolesPermissionsService.removeRoleFromUser(userId, roleId);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}
