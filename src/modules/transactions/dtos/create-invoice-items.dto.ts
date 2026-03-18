import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsInt, IsDate } from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty({ description: 'UUID of the invoice item', required: false })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'UUID of the invoice', required: false })
  @IsOptional()
  @IsUUID()
  invoice_id?: string;

  @ApiProperty({ description: 'Description of the invoice item', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'UUID of the professional', required: false })
  @IsOptional()
  @IsUUID()
  professional_uuid?: string;

  @ApiProperty({ description: 'UUID of the prevision', required: false })
  @IsOptional()
  @IsUUID()
  prevision_id?: string;

  @ApiProperty({ description: 'Quantity of the item', required: false })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ description: 'Total price of the item (integer, pesos chilenos)', required: false })
  @IsOptional()
  @IsInt()
  total_price?: number;

  @ApiProperty({ description: 'Discount amount', required: false })
  @IsOptional()
  @IsInt()
  discount_amount?: number;

  @ApiProperty({ description: 'Creation date', required: false })
  @IsOptional()
  @IsDate()
  created_at?: Date;

  @ApiProperty({ description: 'Update date', required: false })
  @IsOptional()
  @IsDate()
  updated_at?: Date;
}
