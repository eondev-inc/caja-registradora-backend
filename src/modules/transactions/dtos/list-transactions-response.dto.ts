import { transaction_status_enum, invoice_status_enum } from '@prisma/client';

/**
 * DTO para representar un item de factura en la respuesta de transacciones
 */
export class InvoiceItemResponseDto {
  id: string;
  quantity: number;
  total_price: number;
  professional_uuid: string;
}

/**
 * DTO para representar una factura en la respuesta de transacciones
 */
export class InvoiceResponseDto {
  id: string;
  status: invoice_status_enum;
  total_amount: number;
  invoice_items: InvoiceItemResponseDto[];
}

/**
 * DTO para representar un método de pago en la respuesta de transacciones
 */
export class PaymentMethodResponseDto {
  description: string;
}

/**
 * DTO para representar un tipo de transacción en la respuesta de transacciones
 */
export class TransactionTypeResponseDto {
  description: string;
}

/**
 * DTO principal para la respuesta del listado de transacciones por usuario
 * Representa la estructura exacta de datos que devuelve la query con select
 */
export class ListTransactionsResponseDto {
  id: string;
  amount: number;
  description: string;
  status: transaction_status_enum;
  payment_method: PaymentMethodResponseDto;
  transaction_type: TransactionTypeResponseDto;
  invoice: InvoiceResponseDto;
}

/**
 * DTO para la respuesta completa del método listTransactionsByUser
 * Contiene un array de transacciones
 */
export class ListTransactionsByUserResponseDto {
  transactions: ListTransactionsResponseDto[];
  total: number;
  message?: string;
}
