import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { OpenRegister } from '../../openRegister/entities/openRegister.entity';

export class Reconciliation {
  id: string;
  open_register_id: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  date: Date | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  opening_balance: Prisma.Decimal | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  closing_balance: Prisma.Decimal | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  expected_balance: Prisma.Decimal | null;
  sales_summary: string | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  total_sales: Prisma.Decimal | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  cash_deposits: Prisma.Decimal | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  cash_withdrawals: Prisma.Decimal | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  discrepancy: Prisma.Decimal | null;
  notes: string | null;
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
  approved_by: string | null;
  open_register?: OpenRegister;
}
