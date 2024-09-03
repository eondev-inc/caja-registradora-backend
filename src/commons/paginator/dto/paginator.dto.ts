import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NUMBER_VALIDATION_MESSAGE } from '@/helpers/validators/validation-messages';

export class PaginatorDto {
  @IsOptional()
  @IsNumber({}, { message: NUMBER_VALIDATION_MESSAGE })
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
    description: 'Número de página',
  })
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: NUMBER_VALIDATION_MESSAGE })
  @Type(() => Number)
  @Min(0)
  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
    description: 'Límite de registros de página',
  })
  limit?: number = 0;
}
