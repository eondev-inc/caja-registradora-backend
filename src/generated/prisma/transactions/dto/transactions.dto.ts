import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionsDto {
  id: string;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  amount: Prisma.Decimal;
  description: string | null;
  reference_number: string | null;
  status: boolean | null;
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
