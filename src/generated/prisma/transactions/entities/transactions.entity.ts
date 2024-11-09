
import {Prisma,transaction_status_enum} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Invoice} from '../../invoice/entities/invoice.entity'
import {OpenRegister} from '../../openRegister/entities/openRegister.entity'
import {PaymentMethod} from '../../paymentMethod/entities/paymentMethod.entity'
import {TransactionType} from '../../transactionType/entities/transactionType.entity'


export class Transactions {
  id: string ;
open_register_id: string ;
invoice_id: string ;
transaction_type_id: string ;
payment_method_id: string ;
@ApiProperty({
  type: `number`,
  format: `double`,
})
amount: Prisma.Decimal ;
description: string  | null;
reference_number: string  | null;
@ApiProperty({
  enum: transaction_status_enum,
})
status: transaction_status_enum ;
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
invoice?: Invoice ;
open_register?: OpenRegister ;
payment_method?: PaymentMethod ;
transaction_type?: TransactionType ;
}
