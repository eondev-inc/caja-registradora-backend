
import {ApiProperty} from '@nestjs/swagger'


export class RolesDto {
  id: string ;
role_name: string  | null;
description: string  | null;
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
}
