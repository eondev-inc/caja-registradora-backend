
import {Prisma} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateInvoiceDto {
  custumer_nid?: string;
invoice_number?: string;
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
payment_status_id?: string;
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
}
