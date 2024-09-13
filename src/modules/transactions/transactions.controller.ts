import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionsDto } from './dtos/create.transactions.dto';
import { SupabaseGuard } from '@/commons/guards/supabase.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('create')
  async createTransaction(@Body() createTransactionDto) {
    return await this.transactionsService.createTransaction(
      createTransactionDto,
    );
  }

  // @Patch('update')
  // async updateTransaction(@Body() updateTransactionDto: UpdateTransactionDto) {
  //   return this.transactionsService.updateTransaction(updateTransactionDto);
  // }

  @Get('list-by-user/:id')
  async listTransactionsByUser(@Param('id') userId: string) {
    return this.transactionsService.listTransactionsByUser(userId);
  }

  @Get('list-by-center/:code')
  async listTransactionsByCenter(@Param('code') branchCode: string) {
    return this.transactionsService.listTransactionsByCenter(branchCode);
  }
}
