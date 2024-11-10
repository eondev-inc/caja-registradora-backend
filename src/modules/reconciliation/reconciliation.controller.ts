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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { Users } from '@/generated/prisma/users/entities/users.entity';
import { CreateReconciliationDto } from '../../generated/prisma/reconciliation/dto/create-reconciliation.dto';

@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@ApiTags('reconciliation')
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Generate pre-reconciliation' })
  @ApiResponse({
    status: 201,
    description: 'Pre-reconciliation generated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async generateReconciliation(@Req() req) {
    const user = req.user as Users;
    return await this.reconciliationService.generatePreReconciliation(user.id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a reconciliation' })
  @ApiResponse({
    status: 201,
    description: 'Reconciliation created successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createReconciliation(@Req() req, @Body() createReconcelation) {
    const user = req.user as Users;
    return await this.reconciliationService.createReconciliation(
      user.id,
      createReconcelation,
    );
  }

  @Patch('approve/:id')
  @ApiOperation({ summary: 'Approve a reconciliation' })
  @ApiResponse({
    status: 200,
    description: 'Reconciliation approved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Reconciliation not found.' })
  async approveReconciliation(@Param('id') id: string) {
    return await this.reconciliationService.approveReconciliation(id);
  }

  @Patch('reject/:id')
  @ApiOperation({ summary: 'Reject a reconciliation' })
  @ApiResponse({
    status: 200,
    description: 'Reconciliation rejected successfully.',
  })
  @ApiResponse({ status: 404, description: 'Reconciliation not found.' })
  async rejectReconciliation(@Param('id') id: string) {
    return await this.reconciliationService.rejectReconciliation(id);
  }

  @Get('list-by-user')
  @ApiOperation({ summary: 'List reconciliations by user' })
  @ApiResponse({ status: 200, description: 'List of reconciliations by user.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async listReconciliationsByUser(@Req() req) {
    const user = req.user as Users;
    return await this.reconciliationService.listReconciliationsByUser(user.id);
  }

  @Get('list-by-center/:code')
  @ApiOperation({ summary: 'List reconciliations by center' })
  @ApiResponse({
    status: 200,
    description: 'List of reconciliations by center.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async listReconciliationsByCenter(@Param('code') branchCode: string) {
    return await this.reconciliationService.listReconciliationsByCenter(
      branchCode,
    );
  }
}
