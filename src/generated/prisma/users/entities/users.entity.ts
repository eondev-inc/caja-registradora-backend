
import {ApiProperty} from '@nestjs/swagger'
import {Cashiers} from '../../cashiers/entities/cashiers.entity'
import {OpenRegister} from '../../openRegister/entities/openRegister.entity'
import {Roles} from '../../roles/entities/roles.entity'
import {UsersTokens} from '../../usersTokens/entities/usersTokens.entity'


export class Users {
  id: string ;
user_id: string ;
email: string  | null;
password: string  | null;
forenames: string  | null;
surnames: string  | null;
nid_type: string  | null;
nid: string  | null;
role_id: string  | null;
branch_code: string  | null;
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
status: boolean  | null;
cashiers?: Cashiers[] ;
open_register?: OpenRegister[] ;
roles?: Roles  | null;
users_tokens?: UsersTokens[] ;
}
