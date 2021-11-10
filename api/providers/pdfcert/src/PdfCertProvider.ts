import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  rgb,
  PDFPage,
  PDFFont,
  PDFPageDrawTextOptions,
  RotationTypes,
} from 'pdf-lib';

import { provider } from '@ilos/common';
import { MariannePaths } from './assets/marianne';

import {
  PdfCertProviderInterface,
  PdfCertProviderInterfaceResolver,
} from './interfaces/PdfCertProviderInterfaceResolver';
import { PdfTemplateData } from './interfaces/PdfTemplateData';
import { PdfCertRow } from './interfaces/PdfCertRow';

@provider({
  identifier: PdfCertProviderInterfaceResolver,
})
export class PdfCertProvider implements PdfCertProviderInterface {
  private size = 12;
  private tableX = 60;
  private tableY = 450;
  private tableLineHeight = 20;

  private pdfDoc: PDFDocument;
  private page: PDFPage;
  private fonts: {
    regular?: PDFFont;
    bold?: PDFFont;
    italic?: PDFFont;
    monospace?: PDFFont;
  } = {};

  async pdf(data: PdfTemplateData): Promise<Buffer> {
    // Create a new PDFDocument
    this.pdfDoc = await PDFDocument.create();

    // embed fonts
    this.fonts.regular = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    this.fonts.bold = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
    this.fonts.italic = await this.pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    this.fonts.monospace = await this.pdfDoc.embedFont(StandardFonts.Courier);

    // Add a blank page to the document
    this.page = this.pdfDoc.addPage(PageSizes.A4);

    // admin header
    this.page.drawRectangle({
      x: 28,
      y: 28,
      width: 540,
      height: 614,
      borderWidth: 0.5,
      borderColor: rgb(0.1, 0.1, 0.1),
      color: rgb(1, 1, 1),
    });
    this.marianne({ x: 57, y: 612, scale: 0.06 });
    this.text(data.title, { x: 170, y: 600, size: 15, font: this.fonts.bold });

    this.text("Date d'émission :", { x: 170, y: 564, font: this.fonts.bold });
    this.text(data.certificate.created_at, { x: 280, y: 564 });
    this.text('Opérateur :', { x: 170, y: 548, font: this.fonts.bold });
    this.text(data.data.operator.name, { x: 280, y: 548 });

    this.text(`Période : du ${data.certificate.start_at} au ${data.certificate.end_at}`, { x: 160, y: 511 });

    // table
    this.drawHeader(data.data.total_point !== 0);
    for (let i = 0; i < data.data.rows.length; i++) {
      this.drawRow(i, data.data.rows[i], data.data.total_point !== 0);
    }

    // summary
    const totalY = this.tableY - 13 * this.tableLineHeight;

    this.page.drawRectangle({
      x: this.tableX - 12,
      y: totalY - 0.5 * this.tableLineHeight,
      width: 490,
      height: 1.5 * this.tableLineHeight,
      color: rgb(0.95, 0.95, 0.95),
    });

    this.text('Distance :', { x: 60, y: totalY, font: this.fonts.bold });
    this.text(`${data.data.total_km || 0} km`, { x: 122, y: totalY, font: this.fonts.bold });

    this.text('Jours :', { x: 180, y: totalY, font: this.fonts.bold });
    this.text(`${data.data.total_days || 0}`, { x: 222, y: totalY, font: this.fonts.bold });

    if (data.data.total_point !== 0) {
      this.text('Points :', { x: 260, y: totalY, font: this.fonts.bold });
      this.text(`${data.data.total_point || 0}`, { x: 308, y: totalY, font: this.fonts.bold });
    }

    this.text('Reste à charge :', { x: 370, y: totalY, font: this.fonts.bold });
    this.text(`${this.currency(data.data.total_rm)} €`, { x: 470, y: totalY, font: this.fonts.bold });

    // identification
    this.text('Identification', { x: 48, y: 96, font: this.fonts.bold });
    this.text(`Attestation : ${data.certificate.uuid}`, { x: 48, y: 76, font: this.fonts.monospace, size: 10 });
    this.text(`Personne    : ${data.identity}`, { x: 48, y: 60, font: this.fonts.monospace, size: 10 });
    this.text(`Opérateur   : ${data.operator}`, { x: 48, y: 44, font: this.fonts.monospace, size: 10 });

    // QR-code
    this.page.drawSvgPath(data.validation.qrcode, { x: 450, y: 128, color: rgb(0, 0, 0), scale: 0.3333 });
    this.text(`Vérifiez la validité de cette attestation sur ${data.validation.url}`, {
      x: 558,
      y: 44,
      size: 9,
      rotate: { type: RotationTypes.Degrees, angle: 90 },
    });

    // metadata header

    // operator logo gray background - always there
    this.page.drawRectangle({
      x: 30,
      y: 700,
      width: 110,
      height: 110,
      color: rgb(0.95, 0.95, 0.95),
    });

    if ('header' in data) {
      if ('operator' in data.header) {
        if (data.header.operator.name && data.header.operator.name !== '') {
          this.text(data.header.operator.name.trim().substring(0, 26), {
            x: 150,
            y: 794,
            size: 13,
            font: this.fonts.bold,
          });
        }

        if (data.header.operator.content && data.header.operator.content !== '') {
          this.page.moveTo(150, 788);
          data.header.operator.content
            .split('\n')
            .splice(0, 6)
            .forEach((line) => {
              this.page.moveDown(13);
              this.text(line.trim().substr(0, 50), { size: 9 });
            });
        }

        if (data.header.operator.image && data.header.operator.image !== '') {
          try {
            const imageBytes = Buffer.from(data.header.operator.image, 'base64');
            const image = await this.pdfDoc.embedPng(imageBytes);
            const { width, height } = image.scaleToFit(100, 100);

            this.page.drawImage(image, {
              x: 35 + (100 - width) / 2,
              y: 705 + (100 - height) / 2,
              width,
              height,
            });
          } catch (e) {
            console.error(e.message, e);
          }
        }
      }

      if ('identity' in data.header) {
        if (data.header.identity.name && data.header.identity.name !== '') {
          this.text(data.header.identity.name.trim().substring(0, 26), {
            x: 370,
            y: 794,
            size: 13,
            font: this.fonts.bold,
          });
        }

        if (data.header.identity.content && data.header.identity.content !== '') {
          this.page.moveTo(370, 788);
          data.header.identity.content
            .split('\n')
            .splice(0, 6)
            .forEach((line) => {
              this.page.moveDown(13);
              this.text(line.trim().substr(0, 50), { size: 9 });
            });
        }
      }

      if ('notes' in data.header && data.header.notes !== '') {
        this.text(data.header.notes.trim().substring(0, 440), {
          x: 150,
          y: 690,
          size: 8,
          font: this.fonts.italic,
          maxWidth: 415,
          lineHeight: 10,
        });
      }
    }

    return Buffer.from(await this.pdfDoc.save());
  }

  private text(str: string, opts: Partial<PDFPageDrawTextOptions> = {}): void {
    const options = {
      font: this.fonts.regular,
      size: this.size,
      color: rgb(0, 0, 0),
      ...opts,
    };

    // positions can be inherited from moveDown(), etc.
    if ('x' in opts) options.x = opts.x;
    if ('y' in opts) options.y = opts.y;

    this.page.drawText(str, options);
  }

  private drawHeader(withPoints: boolean) {
    const y = this.tableY + 22;

    this.text('Date', { x: this.tableX, y, font: this.fonts.bold });
    this.text('Trajets', { x: this.tableX + 110, y, font: this.fonts.bold });
    this.text('Jours', { x: this.tableX + 160, y, font: this.fonts.bold });
    this.text('Distance', { x: this.tableX + 230, y, font: this.fonts.bold });
    if (withPoints) {
      this.text('Points', { x: this.tableX + 300, y, font: this.fonts.bold });
    }
    this.text('Reste à charge', { x: this.tableX + 380, y, font: this.fonts.bold });
  }

  private drawRow(index: number, row: PdfCertRow, withPoints: boolean): void {
    const rowY = this.tableY - index * this.tableLineHeight;

    if (index % 2 === 0) {
      this.page.drawRectangle({
        x: this.tableX - 12,
        y: rowY - 6,
        width: 490,
        height: this.tableLineHeight,
        color: rgb(0.95, 0.95, 0.95),
      });
    }

    this.text(`${row.month}`, { x: this.tableX + 2, y: rowY });
    this.text(`${row.trips}`, { x: this.tableX + 112, y: rowY });
    this.text(`${row.days}`, { x: this.tableX + 162, y: rowY });
    this.text(`${row.distance} km`, { x: this.tableX + 232, y: rowY });
    if (withPoints) {
      this.text(`${row.points}`, { x: this.tableX + 302, y: rowY });
    }
    this.text(`${this.currency(row.remaining)} €`, { x: this.tableX + 382, y: rowY });
  }

  private marianne(opts: { x: number; y: number; scale: number }): void {
    const { x, y, scale } = opts;
    for (const { fill, path } of MariannePaths) {
      this.page.drawSvgPath(path, { x, y, scale, color: rgb.call(null, ...fill) });
    }
  }

  private currency(nb: number): string {
    return String((nb || 0).toFixed(2)).replace('.', ',');
  }
}
