
import {ApiProperty} from '@nestjs/swagger'


export class UsersTokensDto {
  id: string ;
token: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
created_at: Date  | null;
is_revoked: boolean  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updated_at: Date  | null;
}
