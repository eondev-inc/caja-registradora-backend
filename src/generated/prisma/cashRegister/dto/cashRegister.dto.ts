import { ApiProperty } from '@nestjs/swagger';

export class CashRegisterDto {
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
}
