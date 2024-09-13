import { Prisma } from '@prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreateReconciliationDto {
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  opening_balance?: Prisma.Decimal;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  closing_balance?: Prisma.Decimal;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  expected_balance?: Prisma.Decimal;
  sales_summary: Prisma.InputJsonValue;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  total_sales?: Prisma.Decimal;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  cash_deposits?: Prisma.Decimal;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  cash_withdrawals?: Prisma.Decimal;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  discrepancy?: Prisma.Decimal;
  notes?: string;
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
  approved_by?: string;
}
