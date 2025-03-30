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
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateTransactionsDto } from './dtos/create.transactions.dto';
import { users } from '@prisma/client';
import { JwtAuthGuard } from '@/commons/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('create')
  async createTransaction(@Req() req, @Body() createTransactionDto: CreateTransactionsDto) {
    const user = req.user as users;
    console.log(createTransactionDto);
    return await this.transactionsService.createTransaction(
      user.id,
      createTransactionDto,
    );
  }

  @Get('list-by-user/:entity_id')
  async listTransactionsByUser(@Req() req, @Param('entity_id') entityId: string) {
    const user = req.user as users;
    return this.transactionsService.listTransactionsByUser(user.id, entityId);
  }

  // @Get('list-by-center/:code')
  // async listTransactionsByCenter(@Param('code') branchCode: string) {
  //   return this.transactionsService.listTransactionsByCenter(branchCode);
  // }

  @Patch('cancel/:id')
  async deleteTransaction(@Param('id') id: string) {
    return this.transactionsService.cancelTransaction(id);
  }

  @Patch('devolution/:id')
  async devolutionTransaction(@Param('id') id: string) {
    return this.transactionsService.devolutionTransaction(id);
  }
}
