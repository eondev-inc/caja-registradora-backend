import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class OpenRegisterDto {
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
}
