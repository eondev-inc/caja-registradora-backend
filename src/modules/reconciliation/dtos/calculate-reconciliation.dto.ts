import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CalculateReconciliationDto {
  @ApiProperty(
    {
      description: 'Entity id',
      example: '1',
    }
  )
  @IsString()
  @IsNotEmpty()
  entity_id: string;
}