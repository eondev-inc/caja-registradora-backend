
import {ApiProperty} from '@nestjs/swagger'


export class PaymentStatusDto {
  id: string ;
status_name: string  | null;
description: string  | null;
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
status: boolean  | null;
}
