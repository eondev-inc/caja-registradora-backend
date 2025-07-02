import { Module } from '@nestjs/common';
import { RolesPermissionsController } from './roles-permissions.controller';
import { RolesPermissionsService } from './roles-permissions.service';
import { PermissionsService } from './permissions.service';
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesPermissionsController],
  providers: [
    RolesPermissionsService,
    PermissionsService,
    RolesService,
  ],
  exports: [
    RolesPermissionsService,
    PermissionsService,
    RolesService,
  ],
})
export class RolesPermissionsModule {}
