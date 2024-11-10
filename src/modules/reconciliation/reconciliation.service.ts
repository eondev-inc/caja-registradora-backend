import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateReconciliationDto } from '../../generated/prisma/reconciliation/dto/create-reconciliation.dto';
import {
  reconciliation_status_enum,
  register_status_enum,
  transaction_status_enum,
} from '@prisma/client';

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
  async generatePreReconciliation(userId: string) {
    // Obtain all transactions from the user
    const transactions = await this.prismaService.transactions.findMany({
      where: {
        open_register: {
          cashiers: {
            user_id: userId,
          },
        },
        status: transaction_status_enum.COMPLETADO,
      },
      include: {
        transaction_type: true,
        payment_method: true,
      },
    });

    // Count the number of transactions by type
    const transactionCountByType = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.transaction_type.description]) {
        acc[transaction.transaction_type.description] = 0;
      }
      acc[transaction.transaction_type.description]++;
      return acc;
    }, {});

    // Count the number of transactions by payment method
    const transactionCountByPaymentMethod = transactions.reduce(
      (acc, transaction) => {
        if (!acc[transaction.payment_method.description]) {
          acc[transaction.payment_method.description] = 0;
        }
        acc[transaction.payment_method.description]++;
        return acc;
      },
      {},
    );

    // Calculate the total amount of transactions by payment method
    const totalAmountByPaymentMethod = transactions.reduce(
      (acc, transaction) => {
        if (!acc[transaction.payment_method.description]) {
          acc[transaction.payment_method.description] = 0;
        }
        acc[transaction.payment_method.description] += Number(
          transaction.amount,
        );
        return acc;
      },
      {},
    );

    // Calculate the total amount of all transactions
    const totalAmount = transactions.reduce((acc, transaction) => {
      acc += Number(transaction.amount);
      return acc;
    }, 0);

    return {
      transactionCountByType,
      transactionCountByPaymentMethod,
      totalAmountByPaymentMethod,
      totalAmount,
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
        cashiers: true,
        open_register: {
          select: {
            id: true,
            cashiers_id: true,
            status: true,
          },
          where: {
            status: register_status_enum.ABIERTO,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reconciliation = await this.prismaService.reconciliation.create({
      data: {
        opening_balance: createReconciliation.opening_balance,
        closing_balance: createReconciliation.closing_balance,
        expected_balance: createReconciliation.expected_balance,
        sales_summary: createReconciliation.sales_summary,
        total_sales: createReconciliation.total_sales,
        cash_deposits: createReconciliation.cash_deposits,
        cash_withdrawals: createReconciliation.cash_withdrawals,
        discrepancy: createReconciliation.discrepancy,
        notes: createReconciliation.notes,
        status: reconciliation_status_enum.PENDIENTE,
        approved_by: user.id,
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
  async listReconciliationsByUser(userId: string) {
    return userId;
  }

  /**
   * Lists reconciliations for a center.
   * @param branchCode - The branch code of the center.
   * @returns The branch code.
   */
  async listReconciliationsByCenter(branchCode: string) {
    return branchCode;
  }

  /**
   * Approves a reconciliation previously created.
   * @param reconciliationId - The ID of the reconciliation to approve.
   * @returns The approved reconciliation.
   */
  async approveReconciliation(reconciliationId: string) {
    try {
      const reconciliation = await this.prismaService.reconciliation.update({
        where: {
          id: reconciliationId,
          status: reconciliation_status_enum.PENDIENTE,
        },
        data: {
          status: reconciliation_status_enum.CUADRADO,
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
  async rejectReconciliation(reconciliationId: string) {
    const reconciliation = await this.prismaService.reconciliation.update({
      where: {
        id: reconciliationId,
      },
      data: {
        status: reconciliation_status_enum.RECHAZADO,
      },
    });

    return reconciliation;
  }
}
