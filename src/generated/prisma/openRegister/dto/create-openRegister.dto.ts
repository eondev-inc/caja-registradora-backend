import { Prisma } from '@prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreateOpenRegisterDto {
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  shift_init?: Date;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  shift_end?: Date;
  @ApiProperty({
    type: `number`,
    format: `double`,
  })
  initial_cash?: Prisma.Decimal;
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
