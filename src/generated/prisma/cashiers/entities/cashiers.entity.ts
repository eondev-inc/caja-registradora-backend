
import {ApiProperty} from '@nestjs/swagger'
import {Users} from '../../users/entities/users.entity'
import {OpenRegister} from '../../openRegister/entities/openRegister.entity'


export class Cashiers {
  id: string ;
user_id: string  | null;
status: boolean  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
created_at: Date  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updated_at: Date  | null;
users?: Users  | null;
open_register?: OpenRegister[] ;
}
