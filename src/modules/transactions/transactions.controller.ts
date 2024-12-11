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
import { TransactionsService } from './transactions.service';
import { SupabaseGuard } from '@/commons/guards/supabase.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('create')
  async createTransaction(@Req() req, @Body() createTransactionDto) {
    const user = req.user;
    return await this.transactionsService.createTransaction(
      user.sub,
      createTransactionDto,
    );
  }

  @Get('list-by-user')
  async listTransactionsByUser(@Req() req) {
    const user = req.user;
    return this.transactionsService.listTransactionsByUser(user.sub);
  }

  @Get('list-by-center/:code')
  async listTransactionsByCenter(@Param('code') branchCode: string) {
    return this.transactionsService.listTransactionsByCenter(branchCode);
  }

  @Patch('cancel/:id')
  async deleteTransaction(@Param('id') id: string) {
    return this.transactionsService.cancelTransaction(id);
  }

  @Patch('devolution/:id')
  async devolutionTransaction(@Param('id') id: string) {
    return this.transactionsService.devolutionTransaction(id);
  }
}
