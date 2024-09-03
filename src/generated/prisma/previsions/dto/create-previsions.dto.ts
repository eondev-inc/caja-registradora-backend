import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreatePrevisionsDto {
  code?: string;
  name?: string;
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
