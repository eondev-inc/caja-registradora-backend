import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceItemDto } from './create-invoice-items.dto';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionsDto {
  @ApiProperty({
    description: 'ID of the open register associated with the transaction',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
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
  @IsString()
  @IsNotEmpty()
  transaction_type_id: string;

  @ApiProperty({
    description: 'ID of the payment method used in the transaction',
    example: 'abcde',
  })
  @IsNotEmpty()
  @IsString()
  payment_method_id: string;

  @ApiProperty({
    description: 'Invoice details associated with the transaction',
    type: CreateInvoiceDto,
  })
  @IsObject()
  @Type(() => CreateInvoiceDto)
  invoice: CreateInvoiceDto;
}
