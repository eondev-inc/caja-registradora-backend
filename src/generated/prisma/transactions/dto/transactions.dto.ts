import { Prisma, transaction_status_enum } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionsDto {
  id: string;
  original_transaction_id: string | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  amount: Prisma.Decimal;
  description: string | null;
  reference_number: string | null;
  @ApiProperty({
    enum: transaction_status_enum,
  })
  status: transaction_status_enum;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  created_at: Date | null;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  updated_at: Date | null;
}
