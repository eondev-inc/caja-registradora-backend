import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { CashRegister } from '../../cashRegister/entities/cashRegister.entity';
import { Cashiers } from '../../cashiers/entities/cashiers.entity';
import { Users } from '../../users/entities/users.entity';
import { Reconciliation } from '../../reconciliation/entities/reconciliation.entity';
import { Transactions } from '../../transactions/entities/transactions.entity';

export class OpenRegister {
  id: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  shift_init: Date | null;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  shift_end: Date | null;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  initial_cash: Prisma.Decimal | null;
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
  created_by: string | null;
  cash_register_id: string | null;
  cashiers_id: string | null;
  cash_register?: CashRegister | null;
  cashiers?: Cashiers | null;
  users?: Users | null;
  reconciliation?: Reconciliation[];
  transactions?: Transactions[];
}
