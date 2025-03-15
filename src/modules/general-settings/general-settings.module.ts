import { Module } from '@nestjs/common';
import { GeneralSettingsController } from './general-settings.controller';
import { GeneralSettingsService } from './general-settings.service';

@Module({
  controllers: [GeneralSettingsController],
  providers: [GeneralSettingsService],
})
export class GeneralSettingsModule {};
