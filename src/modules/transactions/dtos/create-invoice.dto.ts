import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNumber, IsDate, IsEnum } from 'class-validator';
import { invoice_status_enum } from '@prisma/client';
import { CreateInvoiceItemDto } from './create-invoice-items.dto';

export class CreateInvoiceDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  custumer_nid?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: invoice_status_enum })
  @IsOptional()
  @IsEnum(invoice_status_enum)
  status?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  payment_status_id?: string;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDate()
  created_at?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDate()
  updated_at?: Date;

  @ApiPropertyOptional({ type: [CreateInvoiceItemDto] })
  @IsOptional()
  invoice_items?: CreateInvoiceItemDto[];
}