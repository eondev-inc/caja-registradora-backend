import { CreateInvoiceDto } from '@/generated/prisma/invoice/dto/create-invoice.dto';
import { CreateInvoiceItemsDto } from '@/generated/prisma/invoiceItems/dto/create-invoiceItems.dto';
import { CreateTransactionsDto as TransactionsDto } from '@/generated/prisma/transactions/dto/create-transactions.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionsDto extends TransactionsDto {
  @ApiProperty({
    description: 'ID of the open register associated with the transaction',
    example: '12345',
  })
  open_register_id: string;

  @ApiProperty({
    description: 'ID of the transaction type',
    example: '67890',
  })
  transaction_type_id: string;

  @ApiProperty({
    description: 'ID of the payment method used in the transaction',
    example: 'abcde',
  })
  payment_method_id: string;

  @ApiProperty({
    description: 'Invoice details associated with the transaction',
    type: CreateInvoiceDto,
  })
  invoice: CreateInvoiceDto;

  @ApiProperty({
    description: 'List of invoice items associated with the transaction',
    type: [CreateInvoiceItemsDto],
  })
  invoice_items: CreateInvoiceItemsDto[];
}
