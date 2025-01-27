import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsInt, IsDecimal, IsDate } from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty({ description: 'UUID of the invoice item' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'UUID of the invoice' })
  @IsUUID()
  invoice_id: string;

  @ApiProperty({ description: 'Description of the invoice item', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Specialty code', required: false })
  @IsOptional()
  @IsString()
  specialty_code?: string;

  @ApiProperty({ description: 'UUID of the professional', required: false })
  @IsOptional()
  @IsUUID()
  professional_uuid?: string;

  @ApiProperty({ description: 'Quantity of the item', required: false })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ description: 'Total price of the item', required: false })
  @IsOptional()
  @IsDecimal()
  total_price?: number;

  @ApiProperty({ description: 'Discount amount', required: false })
  @IsOptional()
  @IsDecimal()
  discount_amount?: number;

  @ApiProperty({ description: 'Creation date', required: false })
  @IsOptional()
  @IsDate()
  created_at?: Date;

  @ApiProperty({ description: 'Update date', required: false })
  @IsOptional()
  @IsDate()
  updated_at?: Date;

  @ApiProperty({ description: 'UUID of the prevision', required: false })
  @IsOptional()
  @IsUUID()
  prevision_id?: string;
}
