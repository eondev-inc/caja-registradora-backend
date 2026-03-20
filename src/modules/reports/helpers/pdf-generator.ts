import PDFDocument from 'pdfkit';

export interface PdfTableColumn {
  header: string;
  key: string;
  width: number;
}

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  entityName?: string;
  dateRange: { start: string; end: string };
  columns: PdfTableColumn[];
  rows: Record<string, string | number>[];
  totals?: Record<string, string | number>;
  generatedBy?: string;
}

const PRIMARY = '#059669'; // emerald-600
const HEADER_BG = '#f0fdf4'; // emerald-50
const BORDER = '#d1fae5'; // emerald-100
const TEXT_DARK = '#1f2937';
const TEXT_GRAY = '#6b7280';

/**
 * Genera un buffer PDF a partir de opciones estructuradas.
 * @param options - Datos del reporte
 * @returns Promise<Buffer> Buffer del PDF generado
 */
export async function generatePdf(options: PdfReportOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 80; // margins

    // --- Header bar ---
    doc.rect(40, 40, pageWidth, 50).fill(PRIMARY);
    doc
      .fillColor('#ffffff')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(options.title, 52, 53, { width: pageWidth - 20 });
    if (options.subtitle) {
      doc.fontSize(9).font('Helvetica').text(options.subtitle, 52, 72, { width: pageWidth - 20 });
    }

    // --- Entity & date info ---
    doc.moveDown(0.2);
    const infoY = 100;
    doc
      .fillColor(TEXT_GRAY)
      .fontSize(8)
      .font('Helvetica')
      .text(`Entidad: ${options.entityName ?? '—'}`, 40, infoY)
      .text(
        `Período: ${options.dateRange.start} — ${options.dateRange.end}`,
        40,
        infoY + 12,
      )
      .text(
        `Generado: ${new Date().toLocaleString('es-CL')}${options.generatedBy ? `  |  Por: ${options.generatedBy}` : ''}`,
        40,
        infoY + 24,
      );

    // --- Table ---
    const tableY = infoY + 44;
    const rowHeight = 18;
    const totalWidth = options.columns.reduce((s, c) => s + c.width, 0);
    const scale = pageWidth / totalWidth;
    const scaledCols = options.columns.map((c) => ({ ...c, width: c.width * scale }));

    // Header row
    let x = 40;
    doc.rect(40, tableY, pageWidth, rowHeight).fill(HEADER_BG);
    doc.rect(40, tableY, pageWidth, rowHeight).stroke(BORDER);

    scaledCols.forEach((col) => {
      doc
        .fillColor(PRIMARY)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(col.header, x + 3, tableY + 4, { width: col.width - 6, ellipsis: true });
      x += col.width;
    });

    // Data rows
    options.rows.forEach((row, i) => {
      const rowY = tableY + rowHeight * (i + 1);
      const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
      doc.rect(40, rowY, pageWidth, rowHeight).fill(bg).stroke(BORDER);

      x = 40;
      scaledCols.forEach((col) => {
        const val = row[col.key] ?? '';
        doc
          .fillColor(TEXT_DARK)
          .fontSize(7.5)
          .font('Helvetica')
          .text(String(val), x + 3, rowY + 4, { width: col.width - 6, ellipsis: true });
        x += col.width;
      });
    });

    // Totals row
    if (options.totals) {
      const totY = tableY + rowHeight * (options.rows.length + 1);
      doc.rect(40, totY, pageWidth, rowHeight).fill(HEADER_BG).stroke(BORDER);
      x = 40;
      scaledCols.forEach((col) => {
        const val = options.totals![col.key] ?? '';
        doc
          .fillColor(PRIMARY)
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(String(val), x + 3, totY + 4, { width: col.width - 6, ellipsis: true });
        x += col.width;
      });
    }

    // --- Footer ---
    doc
      .fillColor(TEXT_GRAY)
      .fontSize(7)
      .text('Caja Digital — Reporte generado automáticamente', 40, doc.page.height - 30, {
        width: pageWidth,
        align: 'center',
      });

    doc.end();
  });
}

/** Formatea un entero (centavos o pesos) como moneda chilena */
export function formatCLP(amount: number | null | undefined): string {
  if (amount == null) return '$0';
  return `$${amount.toLocaleString('es-CL')}`;
}

/** Formatea una fecha ISO como dd/MM/yyyy HH:mm */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
