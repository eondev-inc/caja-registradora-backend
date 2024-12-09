import { Transactions } from '@/generated/prisma/transactions/entities/transactions.entity';
import { CreateTransactionsDto } from './dtos/create.transactions.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { register_status_enum, transaction_status_enum } from '@prisma/client';

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
    userId: string,
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

    console.log('Invoice created', { createTransactionDto });

    // Get the open register of the user
    const openRegister = await this.prismaService.open_register.findFirst({
      where: {
        cashiers: {
          user_id: userId,
        },
        status: register_status_enum.ABIERTO,
      },
    });

    //Then Create the transaction
    return await this.prismaService.transactions.create({
      data: {
        amount: createTransactionDto.amount,
        invoice_id: invoice.id,
        open_register_id: openRegister.id,
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
        status: {
          in: [
            transaction_status_enum.COMPLETADO,
            transaction_status_enum.CANCELADO,
          ],
        },
      },
      select: {
        id: true,
        amount: true,
        description: true,
        status: true,
        payment_method: {
          select: {
            description: true,
          },
        },
        transaction_type: {
          select: {
            description: true,
          },
        },
        invoice: {
          select: {
            id: true,
            status: true,
            total_amount: true,
            invoice_items: {
              select: {
                id: true,
                quantity: true,
                total_price: true,
                specialty_code: true,
                professional_uuid: true,
              },
            },
          },
        },
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

  /**
   * Cancels a transaction given its ID.
   * @param id - The ID of the transaction to cancel.
   * @returns Transaction with the status CANCELADO.
   */
  async cancelTransaction(id: string) {
    return await this.prismaService.transactions.update({
      where: {
        id,
      },
      data: {
        status: transaction_status_enum.CANCELADO,
      },
    });
  }

  /**
   * Devolves a transaction given its ID.
   * @param id - The ID of the transaction to devolve.
   * @returns A new transaction with the same invoice but with a negative amount.
   */
  async devolutionTransaction(id: string) {
    // Update the original transaction status to DEVUELTO
    const originalTransaction = await this.prismaService.transactions.update({
      where: { id },
      data: { status: transaction_status_enum.DEVUELTO },
    });

    const transactionDevolutionType =
      await this.prismaService.transaction_type.findFirst({
        where: { transaction_name: 'DEVOLUCION' },
      });

    // Create a new transaction with the same invoice but with a negative amount
    return await this.prismaService.transactions.create({
      data: {
        amount: -originalTransaction.amount,
        invoice_id: originalTransaction.invoice_id,
        open_register_id: originalTransaction.open_register_id,
        transaction_type_id: transactionDevolutionType.id,
        payment_method_id: originalTransaction.payment_method_id,
        description: `Devolución de la transacción ${originalTransaction.id}`,
        status: transaction_status_enum.COMPLETADO,
      },
    });
  }
}
