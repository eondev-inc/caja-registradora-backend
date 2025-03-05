import { Controller, Get, UseGuards } from '@nestjs/common';
import { GeneralSettinsService } from './general-settings.service';
import { JwtAuthGuard } from '@/commons/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('general-settings')
export class GeneralSettingsController {
  constructor(private readonly generalService: GeneralSettinsService){}

  @Get() 
  getGeneralSettings(): string {
    return 'Hello from general settings';
  }

  @Get('payment-methods')
  getPaymentMethods() {
    return this.generalService.getPaymentMethods();
  }
}