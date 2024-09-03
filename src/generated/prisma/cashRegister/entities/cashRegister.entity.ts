import { ApiProperty } from '@nestjs/swagger';
import { OpenRegister } from '../../openRegister/entities/openRegister.entity';

export class CashRegister {
  id: string;
  branch_code: string | null;
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
  status: boolean | null;
  open_register?: OpenRegister[];
}
