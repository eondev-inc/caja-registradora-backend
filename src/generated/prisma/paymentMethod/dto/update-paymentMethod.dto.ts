import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentMethodDto {
  method_name?: string;
  description?: string;
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
