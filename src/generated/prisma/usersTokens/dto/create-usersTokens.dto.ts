import { ApiProperty } from '@nestjs/swagger';

export class CreateUsersTokensDto {
  token?: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
    default: `now`,
  })
  created_at?: Date;
  @ApiProperty({
    default: false,
  })
  is_revoked?: boolean;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
    default: `now`,
  })
  updated_at?: Date;
}
