
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class InvoiceItemsDto {
  id: string ;
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
}
