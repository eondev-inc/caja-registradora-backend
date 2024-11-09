
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateInvoiceItemsDto {
  description?: string;
specialty_code?: string;
professional_uuid?: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
quantity?: number;
@ApiProperty({
  type: `number`,
  format: `double`,
})
total_price?: Prisma.Decimal;
@ApiProperty({
  type: `number`,
  format: `double`,
})
discount_amount?: Prisma.Decimal;
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
