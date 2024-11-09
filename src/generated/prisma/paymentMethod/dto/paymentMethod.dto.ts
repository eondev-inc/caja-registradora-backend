
import {ApiProperty} from '@nestjs/swagger'


export class PaymentMethodDto {
  id: string ;
method_name: string  | null;
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
