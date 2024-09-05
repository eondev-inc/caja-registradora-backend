import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreateUsersDto {
  user_id: string;
  email: string;
  password: string;
  forenames?: string;
  surnames?: string;
  nid_type?: string;
  nid: string;
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
