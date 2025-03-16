import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { users as Users } from '@prisma/client';
import { CreateReconciliationDto } from './dtos/create-reconciliation.dto';
import { JwtAuthGuard } from '@/commons/guards/jwt-auth.guard';
import { CalculateReconciliationDto } from './dtos/calculate-reconciliation.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Post('calculate')
  async generateReconciliation(@Req() req, @Body() calculate: CalculateReconciliationDto) {
    const user = req.user as Users;
    return await this.reconciliationService.generatePreReconciliation(user.id, calculate.entity_id);
  }

  @Post('create')
  async createReconciliation(
    @Body() createReconcelation: CreateReconciliationDto,
    @Req() req,
  ) {
    const user = req.user as Users;
    return await this.reconciliationService.createReconciliation(
      user.id,
      createReconcelation,
    );
  }

  @Patch('approve/:id')
  async approveReconciliation(@Req() req, @Param('id') id: string) {
    const user = req.user as Users;
    return await this.reconciliationService.approveReconciliation(user.id, id);
  }

  @Patch('reject/:id')
  async rejectReconciliation(@Req() req, @Param('id') id: string) {
    const user = req.user as Users;
    return await this.reconciliationService.rejectReconciliation(user.id, id);
  }

  @Get('list-by-user/:entity-id')
  async listReconciliationsByUser(@Req() req, @Param('entity-id') entityId: string) {
    const user = req.user as Users;
    return await this.reconciliationService.listReconciliationsByUser(user.id, entityId);
  }

  @Get('list-by-center/:entity-id')
  async listReconciliationsByCenter(@Param('entity-id') entityId: string) {
    return await this.reconciliationService.listReconciliationsByCenter(
      entityId,
    );
  }
}
