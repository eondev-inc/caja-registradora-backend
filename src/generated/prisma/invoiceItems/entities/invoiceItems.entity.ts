
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Invoice} from '../../invoice/entities/invoice.entity'
import {Previsions} from '../../previsions/entities/previsions.entity'


export class InvoiceItems {
  id: string ;
invoice_id: string ;
description: string  | null;
specialty_code: string  | null;
professional_uuid: string  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
quantity: number  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
total_price: Prisma.Decimal  | null;
@ApiProperty({
  type: `number`,
  format: `double`,
})
discount_amount: Prisma.Decimal  | null;
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
prevision_id: string  | null;
invoice?: Invoice ;
previsions?: Previsions  | null;
}
