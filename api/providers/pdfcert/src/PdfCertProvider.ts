import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  rgb,
  PDFPage,
  PDFFont,
  PDFPageDrawTextOptions,
  RotationTypes,
  TextAlignment,
} from 'pdf-lib';
import { intlFormat } from 'date-fns';

import { provider } from '@ilos/common';
import { MariannePaths } from './assets/marianne';

import {
  PdfCertProviderInterface,
  PdfCertProviderInterfaceResolver,
} from './interfaces/PdfCertProviderInterfaceResolver';
import { PdfTemplateData } from './interfaces/PdfTemplateData';
import { CarpoolInterface, CarpoolTypeEnum } from './shared/certificate/common/interfaces/CarpoolInterface';
import { MetaPersonInterface } from './shared/certificate/common/interfaces/CertificateMetaInterface';

// helpers to start positioning from top left
const PAGE_SIZE = PageSizes.A4;
const [PAGE_XMAX, PAGE_YMAX] = PAGE_SIZE;

@provider({
  identifier: PdfCertProviderInterfaceResolver,
})
export class PdfCertProvider implements PdfCertProviderInterface {
  private size = 10;
  private tableX = 60;
  private tableY = 550;
  private tableLineHeight = 13;
  private tablePageSize = 36;

  private pdfDoc: PDFDocument;
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
    await this.drawSummaryPage(data);

    // add pages for driver and passenger trips
    await this.drawDetailPages(data, CarpoolTypeEnum.DRIVER, 'Gains conducteur');
    await this.drawDetailPages(data, CarpoolTypeEnum.PASSENGER, 'Contributions passager');

    // number all pages
    await this.drawPageNumbers();

    return Buffer.from(await this.pdfDoc.save());
  }

  private async drawPageLayout(data: PdfTemplateData): Promise<PDFPage> {
    const page = this.pdfDoc.addPage(PAGE_SIZE);
    await this.drawHeader(page, data);
    return page;
  }

  private async drawSummaryPage(data: PdfTemplateData): Promise<void> {
    const page = await this.drawPageLayout(data);

    // general
    this.text(page, `Période : du ${data.certificate.start_at} au ${data.certificate.end_at}`, {
      x: 46,
      y: 620,
      font: this.fonts.bold,
      size: 16,
    });

    // driver
    await this.drawSummaryDetails(page, data.data.driver, CarpoolTypeEnum.DRIVER, "Résumé de l'activité conducteur", {
      x: 46,
      y: 420,
    });

    // passenger
    await this.drawSummaryDetails(
      page,
      data.data.passenger,
      CarpoolTypeEnum.PASSENGER,
      "Résumé de l'activité passager",
      { x: 46, y: 220 },
    );

    this.text(page, `Un problème, une question ?`, { x: 46, y: 62 });
    this.text(page, 'Contactez nous par email à', { x: 46, y: 46 });
    this.text(page, 'attestion@covoiturage.beta.gouv.fr', { x: 172, y: 46, color: rgb(0, 0, 0.8) });

    // QR-code
    page.drawSvgPath(data.validation.qrcode, { x: 450, y: 128, color: rgb(0, 0, 0), scale: 0.3333 });
    this.text(page, `Vérifiez la validité de cette attestation sur`, {
      x: 564,
      y: 44,
      size: 9,
      font: this.fonts.bold,
      rotate: { type: RotationTypes.Degrees, angle: 90 },
    });

    this.text(page, data.validation.url, {
      x: 564,
      y: 224,
      size: 9,
      rotate: { type: RotationTypes.Degrees, angle: 90 },
      color: rgb(0, 0, 0.8),
    });
  }

  private async drawSummaryDetails(
    page: PDFPage,
    data: MetaPersonInterface, // TODO type with total: {}
    type: CarpoolTypeEnum,
    title: string,
    opts: { x: number; y: number },
  ): Promise<void> {
    const { x, y } = opts;

    // background
    page.drawRectangle({ x, y, width: 500, height: 120, color: rgb(0.95, 0.95, 0.95) });

    // title
    this.text(page, title, { x: x + 4, y: y + 132, font: this.fonts.bold, size: 13 });

    // data
    this.text(page, 'Nombre de trajets effectués au total :', { x: x + 245, y: y + 88, align: TextAlignment.Right });
    this.text(page, `${data.total.trips} trajets`, { x: x + 255, y: y + 88 });

    this.text(page, 'en semaine :', { x: x + 245, y: y + 74, align: TextAlignment.Right });
    this.text(page, `${data.total.week_trips} trajets`, { x: x + 255, y: y + 74 });

    this.text(page, 'le weekend :', { x: x + 245, y: y + 60, align: TextAlignment.Right });
    this.text(page, `${data.total.weekend_trips} trajets`, { x: x + 255, y: y + 60 });

    this.text(page, 'Kilomètres parcourus :', { x: x + 245, y: y + 36, align: TextAlignment.Right });
    this.text(page, `${data.total.km} km`, { x: x + 255, y: y + 36 });

    const eurosTitle = type === CarpoolTypeEnum.DRIVER ? 'Gain conducteur :' : 'Contribution passager :';
    this.text(page, eurosTitle, { x: x + 245, y: y + 22, align: TextAlignment.Right });
    this.text(page, `${this.currency(data.total.euros)} €`, { x: x + 255, y: y + 22 });
  }

  private async drawDetailPages(data: PdfTemplateData, type: CarpoolTypeEnum, title: string): Promise<void> {
    let page: PDFPage | null = null;
    let index = 0;

    for (const row of data.data[type].trips) {
      if (index % this.tablePageSize === 0) {
        page = await this.drawPageLayout(data);

        this.text(page, title, { x: 46, y: 620, font: this.fonts.bold, size: 16 });
        this.text(page, `Période : du ${data.certificate.start_at} au ${data.certificate.end_at}`, { x: 46, y: 600 });

        // table head
        const opts = { y: 568, font: this.fonts.bold, size: 9 };

        this.text(page, 'jour', { x: this.tableX + 10, ...opts });
        this.text(page, 'date', { x: this.tableX + 40, ...opts });
        this.text(page, 'trajets', { x: this.tableX + 300, ...opts });
        this.text(page, 'distance', { x: this.tableX + 360, ...opts });
        this.text(page, 'gains', { x: this.tableX + 440, ...opts });
      }

      if (!page) return;

      // console.debug({ index, idx: index % this.tablePageSize, row });
      this.drawRow(page, index % this.tablePageSize, row);
      index++;
    }
  }

  private async drawPageNumbers(): Promise<void> {
    const count = this.pdfDoc.getPageCount();
    this.pdfDoc.getPages().forEach((page, i) => {
      this.text(page, `page ${i + 1} / ${count}`, {
        x: PAGE_XMAX / 2,
        y: 28,
        font: this.fonts.regular,
        size: 8,
        align: TextAlignment.Center,
      });
    });
  }

  private async drawHeader(page: PDFPage, data: PdfTemplateData): Promise<void> {
    // fill the header with light gray rectangle
    page.drawRectangle({
      x: 0,
      y: 682,
      width: PAGE_XMAX,
      height: 160,
      color: rgb(0.95, 0.95, 0.95),
    });

    // draw a white rectangle below Marianne
    page.drawRectangle({
      x: 26,
      y: 794,
      width: 60,
      height: 31.2,
      color: rgb(1, 1, 1),
    });
    this.marianne(page, { x: 16, y: 825.2, scale: 0.06 });

    // title
    this.text(page, 'Attestation de covoiturage', { x: 116, y: 810, font: this.fonts.bold, size: 14 });
    this.text(page, `Date d'émission : ${data.certificate.created_at}`, { x: 116, y: 794, font: this.fonts.regular });

    // metadata header

    // operator logo gray background - always there
    page.drawRectangle({
      x: 508,
      y: 754,
      width: 72,
      height: 72,
      color: rgb(0.92, 0.92, 0.92),
    });

    if ('header' in data) {
      if ('operator' in data.header) {
        if (data.header.operator.name && data.header.operator.name !== '') {
          this.text(page, data.header.operator.name.trim().substring(0, 26), {
            x: 578,
            y: 740,
            size: 12,
            font: this.fonts.bold,
            align: TextAlignment.Right,
          });
        }

        // if (data.header.operator.content && data.header.operator.content !== '') {
        //   page.moveTo(150, 788);
        //   data.header.operator.content
        //     .split('\n')
        //     .splice(0, 6)
        //     .forEach((line) => {
        //       page.moveDown(13);
        //       this.text(page, line.trim().substr(0, 50), { size: 9 });
        //     });
        // }

        if (data.header.operator.image && data.header.operator.image !== '') {
          try {
            const imageBytes = Buffer.from(data.header.operator.image, 'base64');
            const image = await this.pdfDoc.embedPng(imageBytes);
            const { width, height } = image.scaleToFit(70, 70);

            page.drawImage(image, {
              x: 508 + (70 - width) / 2,
              y: 754 + (70 - height) / 2,
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
          this.text(page, data.header.identity.name.trim().substring(0, 26), {
            x: 16,
            y: 740,
            size: 12,
            font: this.fonts.bold,
          });
        }

        if (data.header.identity.content && data.header.identity.content !== '') {
          page.moveTo(16, 738);
          data.header.identity.content
            .split('\n')
            .splice(0, 3)
            .forEach((line) => {
              page.moveDown(13);
              this.text(page, line.trim().substr(0, 50), { size: 8 });
            });
        }
      }

      // TODO
      if ('notes' in data.header && data.header.notes !== '') {
        this.text(page, data.header.notes.trim().substring(0, 440), {
          x: 150,
          y: 690,
          size: 8,
          font: this.fonts.italic,
          maxWidth: 415,
          lineHeight: 10,
        });
      }
    }

    // identification
    this.text(page, "Identification de l'attestation", {
      x: 578,
      y: 722,
      font: this.fonts.bold,
      size: 8,
      align: TextAlignment.Right,
    });
    this.text(page, `Attestation : ${data.certificate.uuid}`, {
      x: 578,
      y: 710,
      font: this.fonts.monospace,
      size: 8,
      align: TextAlignment.Right,
    });
    this.text(page, `Personne    : ${data.identity}`, {
      x: 578,
      y: 700,
      font: this.fonts.monospace,
      size: 8,
      align: TextAlignment.Right,
    });
    this.text(page, `Opérateur   : ${data.operator}`, {
      x: 578,
      y: 690,
      font: this.fonts.monospace,
      size: 8,
      align: TextAlignment.Right,
    });

    // page border
    page.drawRectangle({
      x: 16,
      y: 16,
      width: PAGE_XMAX - 32,
      height: PAGE_YMAX - 192,
      borderWidth: 0.25,
      borderColor: rgb(0.67, 0.67, 0.67),
    });
  }

  private text(
    page: PDFPage,
    str: string,
    opts: Partial<PDFPageDrawTextOptions & { align: TextAlignment }> = {},
  ): void {
    const options = {
      font: this.fonts.regular,
      size: this.size,
      color: rgb(0, 0, 0),
      align: TextAlignment.Left,
      ...opts,
    };

    // positions can be inherited from moveDown(), etc.
    if ('x' in opts) options.x = opts.x;
    if ('y' in opts) options.y = opts.y;

    switch (options.align) {
      case TextAlignment.Right:
        if (!('x' in opts)) throw new Error('You must set x position when aligning right');
        options.x = options.x - options.font.widthOfTextAtSize(str, options.size);
        break;
      case TextAlignment.Center:
        if (!('x' in opts)) throw new Error('You must set x position when aligning center');
        options.x = options.x - options.font.widthOfTextAtSize(str, options.size) / 2;
        break;
    }

    page.drawText(str, options);
  }

  private drawRow(page: PDFPage, index: number, row: CarpoolInterface): void {
    const rowY = this.tableY - index * this.tableLineHeight;
    const size = 8;

    if (index % 2 === 0) {
      page.drawRectangle({
        x: this.tableX - 12,
        y: rowY - 4,
        width: 490,
        height: this.tableLineHeight,
        color: rgb(0.95, 0.95, 0.95),
      });
    }

    this.text(page, `${this.jour(new Date(row.datetime).getDay())}`, { x: this.tableX + 10, y: rowY, size });
    this.text(
      page,
      `${intlFormat(
        new Date(row.datetime),
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
        { locale: 'fr-FR' },
      )}`,
      { x: this.tableX + 40, y: rowY, size },
    );
    this.text(page, `${row.trips}`, { x: this.tableX + 300, y: rowY, size });
    this.text(page, `${row.km} km`, { x: this.tableX + 360, y: rowY, size });
    this.text(page, `${this.currency(row.euros)} €`, { x: this.tableX + 440, y: rowY, size });
  }

  private marianne(page: PDFPage, opts: { x: number; y: number; scale: number }): void {
    const { x, y, scale } = opts;

    for (const { fill, path } of MariannePaths) {
      page.drawSvgPath(path, { x, y, scale, color: rgb.call(null, ...fill) });
    }
  }

  private currency(nb: number): string {
    return String((nb || 0).toFixed(2)).replace('.', ',');
  }

  private jour(i: number): string {
    return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][i];
  }
}
