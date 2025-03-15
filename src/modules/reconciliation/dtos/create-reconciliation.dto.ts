import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNumber, IsDate, IsEnum, IsJSON } from 'class-validator';
import { reconciliation_status_enum } from '@prisma/client';

export class CreateReconciliationDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ type: String })
  @IsUUID()
  open_register_id: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  opening_balance?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  closing_balance?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  expected_balance?: number;

  @ApiProperty({ type: Object })
  @IsJSON()
  sales_summary: any;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  total_sales?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  cash_deposits?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  cash_withdrawals?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  discrepancy?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: reconciliation_status_enum })
  @IsOptional()
  @IsEnum(reconciliation_status_enum)
  status?: string;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDate()
  created_at?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDate()
  updated_at?: Date;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  approved_by?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  entity_id?: string;
}