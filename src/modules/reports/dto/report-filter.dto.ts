import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ReportFilterDto {
  @ApiProperty({
    description: 'Fecha de inicio del período (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del período (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'ID del usuario (cajero). ADMIN/SUPERVISOR pueden filtrar por otro usuario.',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'ID del profesional (para reporte por profesional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @ApiProperty({
    description: 'ID de la previsión (para reporte por previsión)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  previsionId?: string;
}
