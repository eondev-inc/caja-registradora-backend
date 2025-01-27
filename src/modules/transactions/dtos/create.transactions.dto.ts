import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceItemDto } from './create-invoice-items.dto';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionsDto {
  @ApiProperty({
    description: 'ID of the open register associated with the transaction',
    example: '12345',
  })
  open_register_id: string;

  @ApiProperty({
    description: 'Amount of the transaction',
    example: 1000,
  })
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 0,
  })
  amount: number;

  @ApiProperty({
    description: 'Description of the transaction',
    example: 'Payment for services',
  })
  @IsOptional()
  @IsString()
  description?: string;

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
    type: [CreateInvoiceItemDto],
  })
  invoice_items: CreateInvoiceItemDto[];
}
