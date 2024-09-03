import { ApiProperty } from '@nestjs/swagger';

export class PrevisionsDto {
  id: string;
  code: string | null;
  name: string | null;
  status: boolean | null;
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
}
