
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateTransactionTypeDto {
  transaction_name?: string;
description?: string;
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
@ApiProperty({
  default: true,
})
status?: boolean;
}
