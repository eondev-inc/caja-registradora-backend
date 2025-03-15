import { SupabaseGuard } from '@/commons/guards/supabase.guard';
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

@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Post('calculate')
  async generateReconciliation(@Req() req) {
    const user = req.user as Users;
    return await this.reconciliationService.generatePreReconciliation(user.id);
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
  async approveReconciliation(@Param('id') id: string) {
    return await this.reconciliationService.approveReconciliation(id);
  }

  @Patch('reject/:id')
  async rejectReconciliation(@Param('id') id: string) {
    return await this.reconciliationService.rejectReconciliation(id);
  }

  @Get('list-by-user')
  async listReconciliationsByUser(@Req() req) {
    const user = req.user as Users;
    return await this.reconciliationService.listReconciliationsByUser(user.id);
  }

  @Get('list-by-center/:code')
  async listReconciliationsByCenter(@Param('code') branchCode: string) {
    return await this.reconciliationService.listReconciliationsByCenter(
      branchCode,
    );
  }
}
