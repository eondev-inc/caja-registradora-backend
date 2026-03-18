import {
  invoice_status_enum,
  payment_status,
  transactions as Transactions,
} from '@prisma/client';
import { CreateTransactionsDto } from './dtos/create.transactions.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { register_status_enum, transaction_status_enum } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new transaction.
   * Wrapped in a Prisma $transaction to ensure atomicity:
   * creates the invoice with items, validates the open register, then creates the transaction.
   * @param userId - ID of the authenticated user (reserved for future ownership checks).
   * @param createTransactionDto - The data transfer object containing transaction details.
   * @returns The created transaction.
   * @throws NotFoundException When the open register is not found or is not ABIERTO.
   */
  async createTransaction(
    userId: string,
    createTransactionDto: CreateTransactionsDto,
  ): Promise<Transactions> {
    return await this.prismaService.$transaction(async (tx) => {
      // Step 1: Validate open register before creating anything
      const openRegister = await tx.open_register.findFirst({
        where: {
          id: createTransactionDto.open_register_id,
          status: register_status_enum.ABIERTO,
        },
      });

      if (!openRegister) {
        throw new NotFoundException(
          `No se encontró una caja abierta con el ID proporcionado`,
        );
      }

      // Step 2: Create invoice with invoice items explicitly
      const { invoice_items = [], ...invoiceData } = createTransactionDto.invoice;

      const invoice = await tx.invoice.create({
        data: {
          custumer_nid: invoiceData.custumer_nid,
          invoice_number: invoiceData.invoice_number,
          total_amount: invoiceData.total_amount,
          tax_amount: invoiceData.tax_amount,
          notes: invoiceData.notes,
          status: invoice_status_enum.PAGADO,
          invoice_items: {
            create: invoice_items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              total_price: item.total_price,
              discount_amount: item.discount_amount,
              professional_uuid: item.professional_uuid ?? null,
              prevision_id: item.prevision_id ?? null,
            })),
          },
        },
      });

      // Step 3: Create the transaction
      return await tx.transactions.create({
        data: {
          amount: createTransactionDto.amount,
          invoice_id: invoice.id,
          open_register_id: openRegister.id,
          transaction_type_id: createTransactionDto.transaction_type_id,
          payment_method_id: createTransactionDto.payment_method_id,
          description: createTransactionDto.description || 'Una transacción normal',
          folio: createTransactionDto.folio ?? null,
        },
      });
    });
  }

  /**
   * Lists transactions by user with server-side pagination and search.
   * Retrieves the open register of the user, then paginates and filters the associated transactions.
   * @param userId - The ID of the authenticated user.
   * @param entityId - The entity ID (reserved for future multi-entity filtering).
   * @param page - Page number (1-indexed).
   * @param limit - Number of items per page.
   * @param search - Optional search term matched against description and folio.
   * @returns Paginated result with data and meta (total, page, limit, totalPages).
   */
  async listTransactionsByUser(
    userId: string,
    entityId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ) {
    // Guard: check for an open register belonging to the user
    const openRegister = await this.prismaService.open_register.findFirst({
      where: {
        created_by: userId,
        status: register_status_enum.ABIERTO,
      },
    });

    if (!openRegister) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const skip = (page - 1) * limit;

    // Build the where clause
    const whereClause: Record<string, unknown> = {
      open_register_id: openRegister.id,
      status: {
        in: [
          transaction_status_enum.COMPLETADO,
          transaction_status_enum.CANCELADO,
          transaction_status_enum.DEVUELTO,
        ],
      },
    };

    // Add search filter when a term is provided
    if (search && search.trim() !== '') {
      const trimmed = search.trim();
      whereClause['OR'] = [
        { description: { contains: trimmed, mode: 'insensitive' } },
        { folio: { contains: trimmed, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prismaService.$transaction([
      this.prismaService.transactions.count({ where: whereClause }),
      this.prismaService.transactions.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          amount: true,
          description: true,
          folio: true,
          status: true,
          created_at: true,
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
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
   * Validates that the transaction is in COMPLETADO status before cancelling.
   * Also updates the associated invoice status to ANULADO.
   * @param id - The ID of the transaction to cancel.
   * @returns Transaction with the status CANCELADO.
   * @throws NotFoundException When the transaction is not found.
   * @throws BadRequestException When the transaction is not in COMPLETADO status.
   */
  async cancelTransaction(id: string) {
    return await this.prismaService.$transaction(async (tx) => {
      // Step 1: Fetch and validate the transaction
      const transaction = await tx.transactions.findUnique({ where: { id } });

      if (!transaction) {
        throw new NotFoundException(`No se encontró la transacción con ID ${id}`);
      }

      if (transaction.status !== transaction_status_enum.COMPLETADO) {
        throw new BadRequestException(
          `Solo se pueden cancelar transacciones en estado COMPLETADO. Estado actual: ${transaction.status}`,
        );
      }

      // Step 2: Update the invoice to ANULADO
      await tx.invoice.update({
        where: { id: transaction.invoice_id },
        data: {
          status: invoice_status_enum.ANULADO,
          payment_status: payment_status.ANULADO,
        },
      });

      // Step 3: Update the transaction status to CANCELADO
      return await tx.transactions.update({
        where: { id },
        data: { status: transaction_status_enum.CANCELADO },
      });
    });
  }

  /**
   * Devolves a transaction given its ID.
   * Validates that the transaction is in COMPLETADO status before devolving.
   * Updates the original transaction and invoice to DEVUELTO,
   * then creates a new compensating transaction wrapped in a $transaction for atomicity.
   * @param id - The ID of the transaction to devolve.
   * @returns A new transaction with a negative amount representing the devolution.
   * @throws NotFoundException When the transaction or DEVOLUCION type is not found.
   * @throws BadRequestException When the transaction is not in COMPLETADO status.
   */
  async devolutionTransaction(id: string) {
    return await this.prismaService.$transaction(async (tx) => {
      // Step 1: Fetch and validate the transaction
      const transaction = await tx.transactions.findUnique({ where: { id } });

      if (!transaction) {
        throw new NotFoundException(`No se encontró la transacción con ID ${id}`);
      }

      if (transaction.status !== transaction_status_enum.COMPLETADO) {
        throw new BadRequestException(
          `Solo se pueden devolver transacciones en estado COMPLETADO. Estado actual: ${transaction.status}`,
        );
      }

      // Step 2: Fetch the DEVOLUCION transaction type
      const devolutionType = await tx.transaction_type.findFirst({
        where: { transaction_name: 'DEVOLUCION' },
      });

      if (!devolutionType) {
        throw new NotFoundException(
          `No se encontró el tipo de transacción DEVOLUCION en el sistema`,
        );
      }

      // Step 3: Update the invoice to DEVUELTO
      await tx.invoice.update({
        where: { id: transaction.invoice_id },
        data: { status: invoice_status_enum.DEVUELTO },
      });

      // Step 4: Update the original transaction status to DEVUELTO
      const originalTransaction = await tx.transactions.update({
        where: { id },
        data: { status: transaction_status_enum.DEVUELTO },
      });

      // Step 5: Create a new compensating transaction with a negative amount
      return await tx.transactions.create({
        data: {
          amount: -originalTransaction.amount,
          invoice_id: originalTransaction.invoice_id,
          open_register_id: originalTransaction.open_register_id,
          transaction_type_id: devolutionType.id,
          payment_method_id: originalTransaction.payment_method_id,
          description: `Devolución de la transacción ${originalTransaction.id}`,
          status: transaction_status_enum.COMPLETADO,
          original_transaction_id: originalTransaction.id,
        },
      });
    });
  }
}
