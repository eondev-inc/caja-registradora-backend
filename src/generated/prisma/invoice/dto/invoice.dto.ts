import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceDto {
  id: string;
  customer_uuid: string | null;
  invoice_number: string | null;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  invoice_date: Date | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  total_amount: Prisma.Decimal | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  tax_amount: Prisma.Decimal | null;
  notes: string | null;
  status: boolean | null;
  payment_status: string | null;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  created_at: Date | null;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  updated_at: Date | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  amount_in: Prisma.Decimal | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  amount_out: Prisma.Decimal | null;
}
