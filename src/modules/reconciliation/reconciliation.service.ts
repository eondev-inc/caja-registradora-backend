import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  reconciliation_status_enum,
  register_status_enum,
  transaction_status_enum,
} from '@prisma/client';
import { CreateReconciliationDto } from './dtos/create-reconciliation.dto';

@Injectable()
export class ReconciliationService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Generates a pre-reconciliation report for a user.
   * This includes counting the number of transactions by type and payment method,
   * calculating the total amount of transactions by payment method, and the total amount of all transactions.
   * @param userId - The ID of the user.
   * @returns An object containing the transaction counts and total amounts.
   */
  async generatePreReconciliation(userId: string, entityId: string) {
    // Obtain the initial amount from the open register
    const openRegister = await this.prismaService.open_register.findFirst({
      where: {
        created_by: userId,
        cash_entity_id: entityId,
        status: register_status_enum.ABIERTO,
      },
      select: {
        initial_cash: true,
        id: true,
      },
    });

    if (!openRegister) {
      throw new NotFoundException('Open register not found for user');
    }

    // Obtain all transactions from the user
    const transactions = await this.prismaService.transactions.findMany({
      where: {
        open_register: {
          created_by: userId,
          cash_entity_id: entityId,
        },
        status: {
          in: [
            transaction_status_enum.COMPLETADO,
            transaction_status_enum.CANCELADO,
            transaction_status_enum.DEVUELTO,
          ],
        },
      },
      include: {
        transaction_type: true,
        payment_method: true,
      },
    });

    // Filter out original transactions if a completed return transaction exists
    const filteredTransactions = transactions.filter((transaction) => {
      if (transaction.original_transaction_id) {
        return transaction.status !== transaction_status_enum.COMPLETADO;
      }
      return true;
    });

    // Group transactions by type with detailed status
    const transactionDetailsByType = filteredTransactions.reduce(
      (acc, transaction) => {
        const type = transaction.transaction_type.description;
        const status = transaction.status;

        if (!acc[type]) {
          acc[type] = {
            count: 0,
            details: {
              COMPLETADO: 0,
              CANCELADO: 0,
              DEVUELTO: 0,
            },
          };
        }

        acc[type].count++;
        acc[type].details[status]++;

        return acc;
      },
      {},
    );

    // Calculate the total amount of transactions by payment method with detailed status
    const transactionDetailsByPaymentMethod = filteredTransactions.reduce(
      (acc, transaction) => {
        const paymentMethod = transaction.payment_method.description;
        const status = transaction.status;
        let amount = Number(transaction.amount);

        if (
          transaction.status === transaction_status_enum.CANCELADO ||
          transaction.status === transaction_status_enum.DEVUELTO
        ) {
          amount = -amount;
        }

        if (!acc[paymentMethod]) {
          acc[paymentMethod] = {
            count: 0,
            totalAmount: 0,
            details: {
              COMPLETADO: 0,
              CANCELADO: 0,
              DEVUELTO: 0,
            },
          };
        }

        acc[paymentMethod].count++;
        acc[paymentMethod].totalAmount += amount;
        acc[paymentMethod].details[status] += amount;

        return acc;
      },
      {},
    );

    // Calculate the total amount of all transactions
    const totalAmount = filteredTransactions.reduce((acc, transaction) => {
      let amount = Number(transaction.amount);

      if (
        transaction.status === transaction_status_enum.CANCELADO ||
        transaction.status === transaction_status_enum.DEVUELTO
      ) {
        amount = -amount;
      }

      acc += amount;
      return acc;
    }, 0);

    return {
      openRegisterId: openRegister.id,
      initialAmount: Number(openRegister.initial_cash),
      transactionDetailsByType,
      transactionDetailsByPaymentMethod,
      totalAmount,
      expectedBalance: Number(openRegister.initial_cash) + totalAmount,
    };
  }

  /**
   * Creates a reconciliation for a user y an open register.
   * @param userId - The ID of the user.
   * @param createReconciliation - The reconciliation data.
   * @returns The created reconciliation.
   */
  async createReconciliation(
    userId: string,
    createReconciliation: CreateReconciliationDto,
  ) {
    console.log({ userId, createReconciliation });
    const user = await this.prismaService.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        open_register: {
          select: {
            id: true,
            created_by: true,
            cash_entity_id: true,
            status: true,
          },
          where: {
            status: register_status_enum.ABIERTO,
            cash_entity_id: createReconciliation.entity_id,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const calculatedReconciliation = await this.generatePreReconciliation(
      userId,
      createReconciliation.entity_id,
    );

    const reconciliation = await this.prismaService.reconciliation.create({
      data: {
        opening_balance: calculatedReconciliation.initialAmount,
        closing_balance: createReconciliation.closing_balance,
        expected_balance: calculatedReconciliation.expectedBalance,
        sales_summary: createReconciliation.sales_summary,
        total_sales: createReconciliation.total_sales,
        discrepancy: createReconciliation.expected_balance - createReconciliation.closing_balance,
        notes: createReconciliation.notes,
        status: reconciliation_status_enum.PENDIENTE,
        open_register_id: user.open_register[0].id,
      },
    });

    if (!reconciliation) {
      throw new BadRequestException('Error creating reconciliation');
    }
    return reconciliation;
  }

  /**
   * Lists reconciliations for a user.
   * @param userId - The ID of the user.
   * @returns The user ID.
   */
  async listReconciliationsByUser(userId: string, entityId: string) {
    return this.prismaService.reconciliation.findMany({
      where: {
        open_register: {
          created_by: userId,
          cash_entity_id: entityId,
        },
      },
    });
  }

  /**
   * Lists reconciliations for a center.
   * @param branchCode - The branch code of the center.
   * @returns The branch code.
   */
  async listReconciliationsByCenter(entityId: string) {
    return this.prismaService.reconciliation.findMany({
      where: {
        open_register: {
          cash_entity_id: entityId,
        },
      },
    });
  }

  /**
   * Approves a reconciliation previously created.
   * @param reconciliationId - The ID of the reconciliation to approve.
   * @returns The approved reconciliation.
   */
  async approveReconciliation(userId: string, reconciliationId: string) {
    try {
      const reconciliation = await this.prismaService.reconciliation.update({
        where: {
          id: reconciliationId,
          status: reconciliation_status_enum.PENDIENTE,
        },
        data: {
          status: reconciliation_status_enum.CUADRADO,
          approved_by: userId
        },
      });

      // Close the register
      await this.prismaService.open_register.update({
        where: {
          id: reconciliation.open_register_id,
        },
        data: {
          status: register_status_enum.CERRADO,
        },
      });
      return reconciliation;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Rejects a reconciliation previously approved.
   * @param reconciliationId - The ID of the reconciliation to reject.
   * @returns The rejected reconciliation.
   */
  async rejectReconciliation(userId: string, reconciliationId: string) {
    const reconciliation = await this.prismaService.reconciliation.update({
      where: {
        id: reconciliationId,
      },
      data: {
        status: reconciliation_status_enum.RECHAZADO,
        approved_by: userId,
      },
    });

    return reconciliation;
  }
}
