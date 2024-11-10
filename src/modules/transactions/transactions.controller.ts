import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
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
  async createTransaction(@Req() req, @Body() createTransactionDto) {
    const user = req.user;
    return await this.transactionsService.createTransaction(
      user.sub,
      createTransactionDto,
    );
  }

  // @Patch('update')
  // async updateTransaction(@Body() updateTransactionDto: UpdateTransactionDto) {
  //   return this.transactionsService.updateTransaction(updateTransactionDto);
  // }

  @Get('list-by-user')
  async listTransactionsByUser(@Req() req) {
    const user = req.user;
    return this.transactionsService.listTransactionsByUser(user.sub);
  }

  @Get('list-by-center/:code')
  async listTransactionsByCenter(@Param('code') branchCode: string) {
    return this.transactionsService.listTransactionsByCenter(branchCode);
  }
}
