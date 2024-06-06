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

import { provider } from '@/ilos/common/index.ts';
import { MariannePaths } from './assets/marianne.ts';

import {
  PdfCertProviderInterface,
  PdfCertProviderInterfaceResolver,
} from './interfaces/PdfCertProviderInterfaceResolver.ts';
import { PdfTemplateData } from './interfaces/PdfTemplateData.ts';
import { CarpoolInterface, CarpoolTypeEnum } from '@/shared/certificate/common/interfaces/CarpoolInterface.ts';
import { MetaPersonInterface } from '@/shared/certificate/common/interfaces/CertificateMetaInterface.ts';

type TextOptions = Partial<PDFPageDrawTextOptions & { align: TextAlignment; maxChars: number; maxLines: number }>;

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
    await this.drawDetailPages(data, CarpoolTypeEnum.DRIVER, 'Gains conducteur', 'gain');
    await this.drawDetailPages(data, CarpoolTypeEnum.PASSENGER, 'Contributions passager', 'coût');

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
      x: PAGE_XMAX / 2,
      y: 625,
      font: this.fonts.bold,
      size: 16,
      align: TextAlignment.Center,
    });

    // driver
    await this.drawSummaryDetails(page, data.data.driver, CarpoolTypeEnum.DRIVER, "Résumé de l'activité conducteur", {
      x: 46,
      y: 455,
    });

    // passenger
    await this.drawSummaryDetails(
      page,
      data.data.passenger,
      CarpoolTypeEnum.PASSENGER,
      "Résumé de l'activité passager",
      { x: 46, y: 290 },
    );

    // Some legal stuff
    this.text(
      page,
      [
        'La présente attestation est fournie par le Registre de preuve de covoiturage réalisé par le ministère',
        'des Transports. Cette attestation est réalisée grâce aux informations transmises par les opérateurs de',
        'covoiturage participant au Registre. Le ministère des Transports ne saurait être tenue responsable des',
        'informations transmises les opérateurs. Ce document est personnel. Toute personne le modifiant ou',
        "procédant à une fausse déclaration s'expose aux sanctions prévues à l'article 441-1 du code pénal,",
        "prévoyant des peines pouvant aller jusqu'à trois ans d'emprisonnement et 45 000 euros d'amende.",
      ]
        .map((s) => s.trim())
        .join(' '),
      { x: 46, y: 260, size: 8, font: this.fonts.italic, maxWidth: 480, lineHeight: 11 },
    );

    // Some help?
    this.text(page, `Un problème, une question ?`, { x: 46, y: 190 });
    this.text(page, 'Contactez nous :', { x: 46, y: 176 });
    this.text(page, data.support, { x: 124, y: 176, color: rgb(0, 0, 0.8) });

    // Notes
    if ('notes' in data.header && data.header.notes !== '') {
      // title
      this.text(page, 'Notes', {
        x: 48,
        y: 128,
        size: 9,
        font: this.fonts.bold,
      });

      // multilines text field
      this.text(page, data.header.notes.trim().substring(0, 440), {
        x: 48,
        y: 112,
        size: 8,
        font: this.fonts.italic,
        maxWidth: 380,
        lineHeight: 11,
      });
    }

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
    this.text(page, `${data.total.trips} trajet${data.total.trips > 1 ? 's' : ''}`, { x: x + 255, y: y + 88 });

    this.text(page, 'en semaine :', { x: x + 245, y: y + 74, align: TextAlignment.Right });
    this.text(page, `${data.total.week_trips} trajet${data.total.week_trips > 1 ? 's' : ''}`, {
      x: x + 255,
      y: y + 74,
    });

    this.text(page, 'le weekend :', { x: x + 245, y: y + 60, align: TextAlignment.Right });
    this.text(page, `${data.total.weekend_trips} trajet${data.total.weekend_trips > 1 ? 's' : ''}`, {
      x: x + 255,
      y: y + 60,
    });

    this.text(page, 'Kilomètres parcourus :', { x: x + 245, y: y + 36, align: TextAlignment.Right });
    this.text(page, `${String(data.total.distance === 0 ? 0 : data.total.distance / 1000).replace('.', ',')} km`, {
      x: x + 255,
      y: y + 36,
    });

    const eurosTitle = type === CarpoolTypeEnum.DRIVER ? 'Gain conducteur :' : 'Contribution passager :';
    this.text(page, eurosTitle, { x: x + 245, y: y + 22, align: TextAlignment.Right });
    this.text(page, `${this.currency(data.total.amount)} €`, { x: x + 255, y: y + 22 });
  }

  private async drawDetailPages(
    data: PdfTemplateData,
    type: CarpoolTypeEnum,
    title: string,
    money: string,
  ): Promise<void> {
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
        this.text(page, money, { x: this.tableX + 444, ...opts });
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
      x: 16,
      y: 815,
      width: 28,
      height: 10,
      color: rgb(1, 1, 1),
    });
    this.marianne(page, { x: 6, y: 835, scale: 0.12 });

    // title
    this.multiline(page, 'Attestation\nde covoiturage', {
      x: 132,
      y: 793.5,
      font: this.fonts.bold,
      size: 18,
      lineHeight: 15,
    });
    this.text(page, `émise le ${data.certificate.created_at}`, {
      x: 134,
      y: 764,
      font: this.fonts.regular,
      size: 8,
    });

    // identification
    this.text(page, `Attestation : ${data.certificate.uuid}`, {
      x: 15,
      y: 710,
      font: this.fonts.monospace,
      size: 8,
    });
    this.text(page, `Personne    : ${data.identity}`, {
      x: 15,
      y: 700,
      font: this.fonts.monospace,
      size: 8,
    });
    this.text(page, `Opérateur   : ${data.operator}`, {
      x: 15,
      y: 690,
      font: this.fonts.monospace,
      size: 8,
    });

    // metadata header

    // operator logo gray background - always there
    page.drawRectangle({
      x: 529,
      y: 764,
      width: 50,
      height: 50,
      color: rgb(0.92, 0.92, 0.92),
    });

    if ('header' in data) {
      if ('operator' in data.header) {
        if (data.header.operator.name && data.header.operator.name !== '') {
          this.text(page, data.header.operator.name.trim().substring(0, 26), {
            x: 522,
            y: 799,
            size: 12,
            font: this.fonts.bold,
            align: TextAlignment.Right,
          });
        }

        if (data.header.operator.content && data.header.operator.content !== '') {
          this.multiline(page, data.header.operator.content, {
            x: 522,
            y: 785,
            size: 9,
            maxChars: 42,
            maxLines: 6,
            align: TextAlignment.Right,
          });
        }

        if (data.header.operator.image && data.header.operator.image !== '') {
          try {
            const imageBytes = Buffer.from(data.header.operator.image, 'base64');
            const image = await this.pdfDoc.embedPng(imageBytes);
            const { width, height } = image.scaleToFit(48, 48);

            page.drawImage(image, {
              x: 530 + (48 - width) / 2,
              y: 765 + (48 - height) / 2,
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
            x: 578,
            y: 740,
            size: 12,
            font: this.fonts.bold,
            align: TextAlignment.Right,
          });
        }

        if (data.header.identity.content && data.header.identity.content !== '') {
          this.multiline(page, data.header.identity.content, {
            x: 578,
            y: 728,
            size: 8,
            maxChars: 120,
            maxLines: 5,
            align: TextAlignment.Right,
          });
        }
      }
    }

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

  private text(page: PDFPage, str: string, opts: TextOptions = {}): void {
    const options = this.getDefaultOptions(page, opts);

    // filter out unsupported chars
    const charSet = options.font.getCharacterSet();
    const chars = str.split('').reduce((set: Set<string>, c: string) => set.add(c), new Set<string>());
    const codes = [...chars].map((c: string) => c.charCodeAt(0)).sort();
    const diff = codes.filter((n: number) => !charSet.includes(n));
    const clean = diff.reduce((s: string, n: number) => s.replace(String.fromCharCode(n), '?'), str);

    switch (options.align) {
      case TextAlignment.Right:
        if (!('x' in options)) throw new Error('You must set x position when aligning right');
        options.x = options.x - (options.maxWidth || options.font.widthOfTextAtSize(clean, options.size));
        break;
      case TextAlignment.Center:
        if (!('x' in options)) throw new Error('You must set x position when aligning center');
        options.x = options.x - (options.maxWidth || options.font.widthOfTextAtSize(clean, options.size)) / 2;
        break;
    }

    page.drawText(clean, options);
  }

  private multiline(page: PDFPage, str: string, opts: TextOptions = {}): void {
    const options = this.getDefaultOptions(page, { maxChars: 50, maxLines: 6, ...opts });

    // set a default lineHeight if missing as options.y update needs it
    if (!('lineHeight' in options)) options.lineHeight = options.size * 1.22;

    // draw line by line, clipping at maxWidth
    str
      .trim()
      .split('\n')
      .splice(0, options.maxLines)
      .map((s: string) => s.trim().substring(0, options.maxChars))
      .forEach((line) => {
        this.text(page, line, options);
        options.y -= options.lineHeight;
      });
  }

  private getDefaultOptions(page: PDFPage, opts: TextOptions = {}): TextOptions {
    return {
      ...page.getPosition(),
      font: this.fonts.regular,
      size: this.size,
      color: rgb(0, 0, 0),
      align: TextAlignment.Left,
      ...opts,
    };
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

    const km = `${String(row.distance / 1000 || row.km).replace('.', ',')} km`;
    const eu = `${this.currency(row.amount)} €`;

    this.text(page, `${row.trips}`, { x: this.tableX + 320, y: rowY, size, align: TextAlignment.Right });
    this.text(page, km, { x: this.tableX + 398, y: rowY, size, align: TextAlignment.Right });
    this.text(page, eu, { x: this.tableX + 466, y: rowY, size, align: TextAlignment.Right });
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
