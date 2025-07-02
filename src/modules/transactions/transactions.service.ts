import { invoice_status_enum, transactions as Transactions} from '@prisma/client';
import { CreateTransactionsDto } from './dtos/create.transactions.dto';
import { 
  ListTransactionsByUserResponseDto, 
  ListTransactionsResponseDto 
} from './dtos/list-transactions-response.dto';
import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LoggingConfigService } from '@/config/logging/logging-config.service';
import { PrismaService } from 'nestjs-prisma';
import { register_status_enum, transaction_status_enum } from '@prisma/client';

@Injectable()
export class TransactionsService {
  private readonly logger = LoggingConfigService.getInstance().getLogger();

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new transaction.
   * First, it creates an invoice with invoice items, then creates the transaction.
   * @param userId - The ID of the user creating the transaction.
   * @param createTransactionDto - The data transfer object containing transaction details.
   * @returns The created transaction.
   * @throws NotFoundException if the open register is not found
   * @throws InternalServerErrorException for unexpected errors
   */
  async createTransaction(
    userId: string,
    createTransactionDto: CreateTransactionsDto,
  ): Promise<Transactions> {
    try {

      // Get the open register of the user
      const openRegister = await this.prismaService.open_register.findFirst({
        where: {
          id: createTransactionDto.open_register_id,
          status: register_status_enum.ABIERTO,
        },
      });

      if (!openRegister) {
        throw new NotFoundException(
          `Open register with ID ${createTransactionDto.open_register_id} not found or is not open`
        );
      }
    
      const invoice = await this.prismaService.invoice.create({
        data: {
          ...createTransactionDto.invoice,
          status: invoice_status_enum.PAGADO,
          invoice_items: {
            create: createTransactionDto.invoice.invoice_items,
          },
        },
      });

      this.logger.debug('Invoice created successfully', { 
        invoiceId: invoice.id, 
        userId,
        transactionAmount: createTransactionDto.amount 
      });

      // Then Create the transaction
      const transaction = await this.prismaService.transactions.create({
        data: {
          amount: createTransactionDto.amount,
          invoice_id: invoice.id,
          open_register_id: openRegister.id,
          transaction_type_id: createTransactionDto.transaction_type_id,
          payment_method_id: createTransactionDto.payment_method_id,
          description:
            createTransactionDto.description || 'Una transacción normal',
          status: transaction_status_enum.COMPLETADO,
        },
      });

      this.logger.log('Transaction created successfully', {
        transactionId: transaction.id,
        userId,
        amount: transaction.amount,
        openRegisterId: openRegister.id,
      });

      return transaction;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error creating transaction:', error);
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  /**
   * Lists transactions by user.
   * First, it retrieves the open register of the user, then lists the transactions associated with that open register.
   * @param userId - The ID of the user.
   * @param entityId - The ID of the entity.
   * @returns A list of transactions associated with the user's open register.
   * @throws NotFoundException if no open register or transactions are found
   * @throws InternalServerErrorException for unexpected errors
   */
  async listTransactionsByUser(
    userId: string, 
    entityId: string
  ): Promise<ListTransactionsByUserResponseDto> {
    try{
      // First we need to get the open register of the user
      const openRegister = await this.prismaService.open_register.findFirst({
        where: {
          created_by: userId,
          status: register_status_enum.ABIERTO,
          users: {
            entity_users: {
              some: {
                entity_id: entityId,
                status: true,
              },
            },
          },
        },
      });

      if (!openRegister) {
        throw new NotFoundException(`No open register found for user with ID ${userId}`);
      }
      // Then we list the transactions associated with that open register
      const transactions = await this.prismaService.transactions.findMany({
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
                  professional_uuid: true,
                },
              },
            },
          },
        },
      });

      if (transactions.length === 0) {
        throw new NotFoundException(`No transactions found for user with ID ${userId}`);
      }

      // Map the data to our response DTO
      const transactionsResponse: ListTransactionsResponseDto[] = 
        this.mapTransactionsToResponse(transactions);

      return {
        transactions: transactionsResponse,
        total: transactionsResponse.length,
        message: `Found ${transactionsResponse.length} transactions for user`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching transactions:', error);
      throw new InternalServerErrorException('Fatal error! cannot List transactions by user');
    }
  }

  
  /**
   * Lists transactions by center.
   * First, it retrieves the open registers of the center, then lists the transactions associated with those open registers.
   * @param branchCode - The branch code of the center.
   * @returns A list of transactions associated with the center's open registers.
   */
  // async listTransactionsByCenter(branchCode: string) {
  //   // First we need to get the open register of the center
  //   const openRegister = await this.prismaService.open_register.findMany({
  //     where: {
  //       cashiers: {
  //         users: {
  //           branch_code: branchCode,
  //         },
  //       },
  //     },
  //   });

  //   return await this.prismaService.transactions.findMany({
  //     where: {
  //       open_register_id: {
  //         in: openRegister.map((register) => register.id),
  //       },
  //     },
  //   });
  // }

  /**
   * Cancels a transaction given its ID.
   * @param id - The ID of the transaction to cancel.
   * @returns Transaction with the status CANCELADO.
   */
  async cancelTransaction(id: string) {
    try {
      return await this.prismaService.transactions.update({
        where: {
          id,
        },
        data: {
          status: transaction_status_enum.CANCELADO,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error creating transaction:', error);
      throw new InternalServerErrorException('Failed to cancel transaction');
    }
  }

  /**
   * Devolves a transaction given its ID.
   * @param id - The ID of the transaction to devolve.
   * @returns A new transaction with the same invoice but with a negative amount.
   */
  async devolutionTransaction(id: string) {
    try {
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
          original_transaction_id: originalTransaction.id,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error creating transaction:', error);
      throw new InternalServerErrorException('Failed to create transaction');
    }
    
  }

  /**
   * Maps transactions to the response DTO.
   * @param transactions - The transactions query to map.
   * @returns An array of ListTransactionsResponseDto.
   */
  private mapTransactionsToResponse(transactions): ListTransactionsResponseDto[] {
    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      payment_method: {
        description: transaction.payment_method.description,
      },
      transaction_type: {
        description: transaction.transaction_type.description,
      },
      invoice: {
        id: transaction.invoice.id,
        status: transaction.invoice.status,
        total_amount: transaction.invoice.total_amount,
        invoice_items: transaction.invoice.invoice_items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          total_price: item.total_price,
          professional_uuid: item.professional_uuid,
        })),
      },
    }));
  }
}
