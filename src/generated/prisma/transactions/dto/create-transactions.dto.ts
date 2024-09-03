import { Prisma } from '@prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreateTransactionsDto {
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  amount: Prisma.Decimal;
  description?: string;
  reference_number?: string;
  @ApiProperty({
    default: true,
  })
  status?: boolean;
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
