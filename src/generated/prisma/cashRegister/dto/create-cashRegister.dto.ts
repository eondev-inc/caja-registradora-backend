import { ApiProperty } from '@nestjs/swagger';

export class CreateCashRegisterDto {
  branch_code?: string;
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
