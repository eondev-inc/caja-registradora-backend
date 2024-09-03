import { Prisma } from '@prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreateInvoiceDto {
  customer_uuid?: string;
  invoice_number?: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  invoice_date?: Date;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  total_amount?: Prisma.Decimal;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  tax_amount?: Prisma.Decimal;
  notes?: string;
  @ApiProperty({
    default: true,
  })
  status?: boolean;
  payment_status?: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
    default: `now`,
  })
  created_at?: Date;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
    default: `now`,
  })
  updated_at?: Date;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  amount_in?: Prisma.Decimal;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  amount_out?: Prisma.Decimal;
}
