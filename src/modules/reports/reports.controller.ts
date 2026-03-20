import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { JwtAuthGuard } from '@/commons/guards/jwt-auth.guard';
import { RolesGuard } from '@/commons/guards/roles.guard';
import { Roles } from '@/commons/decorators/roles.decorator';
import { RolesAutentia } from '@/modules/auth/enum/autentia-rol.enum';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-sales')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesAutentia.ADMIN, RolesAutentia.SUPERVISOR, RolesAutentia.CAJERO)
  @ApiOperation({ summary: 'Reporte de ventas diarias en PDF' })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-01-31' })
  @ApiQuery({ name: 'userId', required: false })
  async getDailySales(
    @Query() filter: ReportFilterDto,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const user = (req as FastifyRequest & { user: { id: string; roleNames?: string[] } }).user;
    const buffer = await this.reportsService.getDailySales(
      filter,
      user.id,
      user.roleNames ?? [],
    );
    return res
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename="ventas-diarias.pdf"`)
      .header('Content-Length', buffer.length)
      .send(buffer);
  }

  @Get('reconciliations')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesAutentia.ADMIN, RolesAutentia.SUPERVISOR, RolesAutentia.CAJERO)
  @ApiOperation({ summary: 'Reporte de cuadraturas de caja en PDF' })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-01-31' })
  @ApiQuery({ name: 'userId', required: false })
  async getReconciliations(
    @Query() filter: ReportFilterDto,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const user = (req as FastifyRequest & { user: { id: string; roleNames?: string[] } }).user;
    const buffer = await this.reportsService.getReconciliations(
      filter,
      user.id,
      user.roleNames ?? [],
    );
    return res
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename="cuadraturas.pdf"`)
      .header('Content-Length', buffer.length)
      .send(buffer);
  }

  @Get('by-professional')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesAutentia.ADMIN, RolesAutentia.SUPERVISOR, RolesAutentia.CAJERO)
  @ApiOperation({ summary: 'Reporte de atenciones por profesional en PDF' })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-01-31' })
  @ApiQuery({ name: 'professionalId', required: false })
  async getByProfessional(
    @Query() filter: ReportFilterDto,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const user = (req as FastifyRequest & { user: { id: string; roleNames?: string[] } }).user;
    const buffer = await this.reportsService.getByProfessional(
      filter,
      user.id,
      user.roleNames ?? [],
    );
    return res
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename="por-profesional.pdf"`)
      .header('Content-Length', buffer.length)
      .send(buffer);
  }

  @Get('by-prevision')
  @HttpCode(HttpStatus.OK)
  @Roles(RolesAutentia.ADMIN, RolesAutentia.SUPERVISOR, RolesAutentia.CAJERO)
  @ApiOperation({ summary: 'Reporte de atenciones por previsión en PDF' })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-01-31' })
  @ApiQuery({ name: 'previsionId', required: false })
  async getByPrevision(
    @Query() filter: ReportFilterDto,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const user = (req as FastifyRequest & { user: { id: string; roleNames?: string[] } }).user;
    const buffer = await this.reportsService.getByPrevision(
      filter,
      user.id,
      user.roleNames ?? [],
    );
    return res
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename="por-prevision.pdf"`)
      .header('Content-Length', buffer.length)
      .send(buffer);
  }
}
