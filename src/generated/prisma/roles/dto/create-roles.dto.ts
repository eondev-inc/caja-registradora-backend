import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreateRolesDto {
  role_name?: string;
  description?: string;
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
