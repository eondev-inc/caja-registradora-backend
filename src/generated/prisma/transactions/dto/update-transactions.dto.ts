import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionsDto {
  original_transaction_id?: string;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  amount?: Prisma.Decimal;
  description?: string;
  reference_number?: string;
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
