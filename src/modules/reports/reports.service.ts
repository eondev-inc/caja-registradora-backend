import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ReportFilterDto } from './dto/report-filter.dto';
import { generatePdf, formatCLP, formatDate, PdfReportOptions } from './helpers/pdf-generator';
import { RolesAutentia } from '@/modules/auth/enum/autentia-rol.enum';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private buildDateRange(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }
    return { start, end };
  }

  private resolveUserId(
    requestingUserId: string,
    filterUserId: string | undefined,
    roleNames: string[],
  ): string {
    const isPrivileged =
      roleNames.includes(RolesAutentia.ADMIN) || roleNames.includes(RolesAutentia.SUPERVISOR);
    return isPrivileged && filterUserId ? filterUserId : requestingUserId;
  }

  private async getEntityName(userId: string): Promise<string> {
    const eu = await this.prismaService.entity_users.findFirst({
      where: { user_id: userId, status: true },
      include: { entities: true },
    });
    return eu?.entities?.entity_name ?? '—';
  }

  private async getUserFullName(userId: string): Promise<string> {
    const user = await this.prismaService.users.findUnique({ where: { id: userId } });
    if (!user) return '—';
    return `${user.forenames ?? ''} ${user.surnames ?? ''}`.trim();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Ventas Diarias
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera PDF de ventas diarias filtrado por cajero y rango de fechas.
   * @param filter - Parámetros de filtro
   * @param requestingUserId - ID del usuario autenticado
   * @param roleNames - Roles del usuario autenticado
   * @returns Promise<Buffer> PDF generado
   */
  async getDailySales(
    filter: ReportFilterDto,
    requestingUserId: string,
    roleNames: string[],
  ): Promise<Buffer> {
    const { start, end } = this.buildDateRange(filter.startDate, filter.endDate);
    const targetUserId = this.resolveUserId(requestingUserId, filter.userId, roleNames);

    const transactions = await this.prismaService.transactions.findMany({
      where: {
        created_at: { gte: start, lte: end },
        status: 'COMPLETADO',
        open_register: { created_by: targetUserId },
      },
      include: {
        invoice: true,
        payment_method: true,
        transaction_type: true,
        open_register: { include: { users: true } },
      },
      orderBy: { created_at: 'asc' },
    });

    const [entityName, userName] = await Promise.all([
      this.getEntityName(targetUserId),
      this.getUserFullName(targetUserId),
    ]);

    const rows = transactions.map((t) => ({
      fecha: formatDate(t.created_at),
      folio: t.folio ?? '—',
      rut: t.invoice?.custumer_nid ?? '—',
      tipo: t.transaction_type?.transaction_name ?? '—',
      metodo: t.payment_method?.method_name ?? '—',
      monto: formatCLP(t.amount),
    }));

    const total = transactions.reduce((s, t) => s + (t.amount ?? 0), 0);

    const options: PdfReportOptions = {
      title: 'Reporte de Ventas Diarias',
      subtitle: `Cajero: ${userName}`,
      entityName,
      dateRange: { start: filter.startDate, end: filter.endDate },
      columns: [
        { header: 'Fecha', key: 'fecha', width: 80 },
        { header: 'Folio', key: 'folio', width: 50 },
        { header: 'RUT Cliente', key: 'rut', width: 70 },
        { header: 'Tipo', key: 'tipo', width: 70 },
        { header: 'Método Pago', key: 'metodo', width: 70 },
        { header: 'Monto', key: 'monto', width: 60 },
      ],
      rows,
      totals: {
        fecha: 'TOTAL',
        folio: '',
        rut: '',
        tipo: '',
        metodo: `${rows.length} transacciones`,
        monto: formatCLP(total),
      },
      generatedBy: userName,
    };

    return generatePdf(options);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Cuadraturas
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera PDF de cuadraturas de caja filtrado por cajero y rango de fechas.
   * @param filter - Parámetros de filtro
   * @param requestingUserId - ID del usuario autenticado
   * @param roleNames - Roles del usuario autenticado
   * @returns Promise<Buffer> PDF generado
   */
  async getReconciliations(
    filter: ReportFilterDto,
    requestingUserId: string,
    roleNames: string[],
  ): Promise<Buffer> {
    const { start, end } = this.buildDateRange(filter.startDate, filter.endDate);
    const targetUserId = this.resolveUserId(requestingUserId, filter.userId, roleNames);

    const reconciliations = await this.prismaService.reconciliation.findMany({
      where: {
        created_at: { gte: start, lte: end },
        open_register: { created_by: targetUserId },
      },
      include: {
        open_register: { include: { users: true } },
      },
      orderBy: { created_at: 'asc' },
    });

    const [entityName, userName] = await Promise.all([
      this.getEntityName(targetUserId),
      this.getUserFullName(targetUserId),
    ]);

    const rows = reconciliations.map((r) => ({
      fecha: formatDate(r.created_at),
      apertura: formatDate(r.open_register?.shift_init),
      cierre: formatDate(r.open_register?.shift_end),
      saldo_inicial: formatCLP(r.opening_balance),
      ventas: formatCLP(r.total_sales),
      saldo_cierre: formatCLP(r.closing_balance),
      diferencia: formatCLP(r.discrepancy),
      estado: r.status ?? '—',
    }));

    const options: PdfReportOptions = {
      title: 'Reporte de Cuadraturas de Caja',
      subtitle: `Cajero: ${userName}`,
      entityName,
      dateRange: { start: filter.startDate, end: filter.endDate },
      columns: [
        { header: 'Fecha Cuadratura', key: 'fecha', width: 75 },
        { header: 'Apertura', key: 'apertura', width: 75 },
        { header: 'Cierre', key: 'cierre', width: 75 },
        { header: 'Saldo Inicial', key: 'saldo_inicial', width: 60 },
        { header: 'Total Ventas', key: 'ventas', width: 60 },
        { header: 'Saldo Cierre', key: 'saldo_cierre', width: 60 },
        { header: 'Diferencia', key: 'diferencia', width: 55 },
        { header: 'Estado', key: 'estado', width: 55 },
      ],
      rows,
      generatedBy: userName,
    };

    return generatePdf(options);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Por Profesional
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera PDF de atenciones agrupadas por profesional.
   * @param filter - Parámetros de filtro (professionalId opcional)
   * @param requestingUserId - ID del usuario autenticado
   * @param roleNames - Roles del usuario autenticado
   * @returns Promise<Buffer> PDF generado
   */
  async getByProfessional(
    filter: ReportFilterDto,
    requestingUserId: string,
    roleNames: string[],
  ): Promise<Buffer> {
    const { start, end } = this.buildDateRange(filter.startDate, filter.endDate);

    const whereClause: Record<string, unknown> = {
      created_at: { gte: start, lte: end },
    };
    if (filter.professionalId) {
      whereClause.professional_uuid = filter.professionalId;
    }

    const items = await this.prismaService.invoice_items.findMany({
      where: whereClause,
      include: {
        professional: true,
        prevision: true,
        invoice: {
          include: {
            transactions: {
              where: { status: 'COMPLETADO' },
              include: { payment_method: true },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    const entityName = await this.getEntityName(requestingUserId);
    const userName = await this.getUserFullName(requestingUserId);

    const rows = items.map((item) => ({
      fecha: formatDate(item.created_at),
      profesional: item.professional?.professional_name ?? '—',
      especialidad: item.professional?.specialty ?? '—',
      descripcion: item.description ?? '—',
      prevision: item.prevision?.name ?? '—',
      cantidad: item.quantity ?? 0,
      precio: formatCLP(item.total_price),
      descuento: formatCLP(item.discount_amount),
    }));

    const totalPrecio = items.reduce((s, i) => s + (i.total_price ?? 0), 0);
    const totalDescuento = items.reduce((s, i) => s + (i.discount_amount ?? 0), 0);

    const options: PdfReportOptions = {
      title: 'Reporte por Profesional',
      entityName,
      dateRange: { start: filter.startDate, end: filter.endDate },
      columns: [
        { header: 'Fecha', key: 'fecha', width: 70 },
        { header: 'Profesional', key: 'profesional', width: 80 },
        { header: 'Especialidad', key: 'especialidad', width: 70 },
        { header: 'Descripción', key: 'descripcion', width: 90 },
        { header: 'Previsión', key: 'prevision', width: 60 },
        { header: 'Cant.', key: 'cantidad', width: 30 },
        { header: 'Precio', key: 'precio', width: 55 },
        { header: 'Descuento', key: 'descuento', width: 55 },
      ],
      rows,
      totals: {
        fecha: 'TOTAL',
        profesional: '',
        especialidad: '',
        descripcion: '',
        prevision: '',
        cantidad: items.reduce((s, i) => s + (i.quantity ?? 0), 0),
        precio: formatCLP(totalPrecio),
        descuento: formatCLP(totalDescuento),
      },
      generatedBy: userName,
    };

    return generatePdf(options);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Por Previsión
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera PDF de atenciones agrupadas por previsión.
   * @param filter - Parámetros de filtro (previsionId opcional)
   * @param requestingUserId - ID del usuario autenticado
   * @param roleNames - Roles del usuario autenticado
   * @returns Promise<Buffer> PDF generado
   */
  async getByPrevision(
    filter: ReportFilterDto,
    requestingUserId: string,
    roleNames: string[],
  ): Promise<Buffer> {
    const { start, end } = this.buildDateRange(filter.startDate, filter.endDate);

    const whereClause: Record<string, unknown> = {
      created_at: { gte: start, lte: end },
    };
    if (filter.previsionId) {
      whereClause.prevision_id = filter.previsionId;
    }

    const items = await this.prismaService.invoice_items.findMany({
      where: whereClause,
      include: {
        prevision: true,
        professional: true,
        invoice: {
          include: {
            transactions: {
              where: { status: 'COMPLETADO' },
              include: { payment_method: true },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    const entityName = await this.getEntityName(requestingUserId);
    const userName = await this.getUserFullName(requestingUserId);

    const rows = items.map((item) => {
      const tx = item.invoice?.transactions?.[0];
      return {
        fecha: formatDate(item.created_at),
        prevision: item.prevision?.name ?? '—',
        codigo: item.prevision?.code ?? '—',
        profesional: item.professional?.professional_name ?? '—',
        descripcion: item.description ?? '—',
        metodo_pago: tx?.payment_method?.method_name ?? '—',
        cantidad: item.quantity ?? 0,
        precio: formatCLP(item.total_price),
      };
    });

    const totalPrecio = items.reduce((s, i) => s + (i.total_price ?? 0), 0);

    const options: PdfReportOptions = {
      title: 'Reporte por Previsión',
      entityName,
      dateRange: { start: filter.startDate, end: filter.endDate },
      columns: [
        { header: 'Fecha', key: 'fecha', width: 70 },
        { header: 'Previsión', key: 'prevision', width: 70 },
        { header: 'Código', key: 'codigo', width: 40 },
        { header: 'Profesional', key: 'profesional', width: 80 },
        { header: 'Descripción', key: 'descripcion', width: 90 },
        { header: 'Método Pago', key: 'metodo_pago', width: 65 },
        { header: 'Cant.', key: 'cantidad', width: 30 },
        { header: 'Precio', key: 'precio', width: 55 },
      ],
      rows,
      totals: {
        fecha: 'TOTAL',
        prevision: '',
        codigo: '',
        profesional: '',
        descripcion: '',
        metodo_pago: `${rows.length} ítems`,
        cantidad: items.reduce((s, i) => s + (i.quantity ?? 0), 0),
        precio: formatCLP(totalPrecio),
      },
      generatedBy: userName,
    };

    return generatePdf(options);
  }
}
