
import {Prisma,invoice_status_enum} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class InvoiceDto {
  id: string ;
custumer_nid: string  | null;
invoice_number: string  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
total_amount: Prisma.Decimal  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
tax_amount: Prisma.Decimal  | null;
notes: string  | null;
@ApiProperty({
  enum: invoice_status_enum,
})
status: invoice_status_enum ;
payment_status_id: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
created_at: Date  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updated_at: Date  | null;
}
