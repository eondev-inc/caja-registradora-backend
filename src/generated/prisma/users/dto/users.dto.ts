import { ApiProperty } from '@nestjs/swagger';

export class UsersDto {
  id: string;
  user_id: string | null;
  email: string | null;
  password: string | null;
  forenames: string | null;
  surnames: string | null;
  nid_type: string | null;
  nid: string | null;
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
