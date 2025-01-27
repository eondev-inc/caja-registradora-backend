import { transactions as Transactions } from '@prisma/client';
import { CreateTransactionsDto } from './dtos/create.transactions.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { register_status_enum } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new transaction.
   * First, it creates an invoice with invoice items, then creates the transaction.
   * @param createTransactionDto - The data transfer object containing transaction details.
   * @returns The created transaction.
   */
  async createTransaction(
    createTransactionDto: CreateTransactionsDto,
  ): Promise<Transactions> {
    // The first thing to do is create an invoice with invoice_items and then create a transaction
    const invoice = await this.prismaService.invoice.create({
      data: {
        ...createTransactionDto.invoice,
        invoice_items: {
          create: createTransactionDto.invoice_items,
        },
      },
    });

    //Then Create the transaction
    return await this.prismaService.transactions.create({
      data: {
        amount: createTransactionDto.amount,
        invoice_id: invoice.id,
        open_register_id: createTransactionDto.open_register_id,
        transaction_type_id: createTransactionDto.transaction_type_id,
        payment_method_id: createTransactionDto.payment_method_id,
        description:
          createTransactionDto.description || 'Una transacción normal',
      },
    });
  }

  /**
   * Lists transactions by user.
   * First, it retrieves the open register of the user, then lists the transactions associated with that open register.
   * @param userId - The ID of the user.
   * @returns A list of transactions associated with the user's open register.
   */
  async listTransactionsByUser(userId: string) {
    // First we need to get the open register of the user
    const openRegister = await this.prismaService.open_register.findFirst({
      where: {
        cashiers: {
          user_id: userId,
        },
        status: register_status_enum.ABIERTO,
      },
    });

    return await this.prismaService.transactions.findMany({
      where: {
        open_register_id: openRegister.id,
      },
    });
  }

  /**
   * Lists transactions by center.
   * First, it retrieves the open registers of the center, then lists the transactions associated with those open registers.
   * @param branchCode - The branch code of the center.
   * @returns A list of transactions associated with the center's open registers.
   */
  async listTransactionsByCenter(branchCode: string) {
    // First we need to get the open register of the center
    const openRegister = await this.prismaService.open_register.findMany({
      where: {
        cashiers: {
          users: {
            branch_code: branchCode,
          },
        },
      },
    });

    return await this.prismaService.transactions.findMany({
      where: {
        open_register_id: {
          in: openRegister.map((register) => register.id),
        },
      },
    });
  }
}
