import { Module } from '@nestjs/common';
import { GeneralSettingsController } from './general-settings.controller';
import { GeneralSettinsService } from './general-settings.service';

@Module({
  controllers: [GeneralSettingsController],
  providers: [GeneralSettinsService],
})
export class GeneralSettingsModule {};