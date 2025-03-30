import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GeneralSettingsService } from './general-settings.service';

@ApiBearerAuth()
@ApiTags('General Settings')
@Controller('general-settings')
export class GeneralSettingsController {
  constructor(
    private readonly generalSettingsService: GeneralSettingsService,
  ) {}

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get payment methods' })
  @ApiResponse({ status: 200, description: 'List of payment methods' })
  async getPaymentMethods() {
    return await this.generalSettingsService.getPaymentMethods();
  }

  @Get('transaction-types')
  @ApiOperation({ summary: 'Get transaction types' })
  @ApiResponse({ status: 200, description: 'List of transaction types' })
  async getTransactionTypes() {
    return await this.generalSettingsService.getTransactionTypes();
  }

  @Get('previsions')
  @ApiOperation({ summary: 'Get previsions' })
  @ApiResponse({ status: 200, description: 'List of previsions' })
  async getPrevisions() {
    return await this.generalSettingsService.getPrevisions();
  }

  @Get('entities')
  @ApiOperation({ summary: 'Get entities' })
  @ApiResponse({ status: 200, description: 'List of entities' })
  async getEntities() {
    return await this.generalSettingsService.getEntities();
  }
}
