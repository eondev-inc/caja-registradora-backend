
import {ApiProperty} from '@nestjs/swagger'
import {Users} from '../../users/entities/users.entity'


export class UsersTokens {
  id: string ;
user_id: string ;
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
users?: Users ;
}
