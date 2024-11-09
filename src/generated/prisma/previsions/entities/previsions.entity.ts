
import {ApiProperty} from '@nestjs/swagger'
import {InvoiceItems} from '../../invoiceItems/entities/invoiceItems.entity'


export class Previsions {
  id: string ;
code: string  | null;
name: string  | null;
status: boolean  | null;
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
invoice_items?: InvoiceItems[] ;
}
