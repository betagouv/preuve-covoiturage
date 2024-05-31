import AdmZip from 'adm-zip';
import { AddWorksheetOptions, Worksheet, stream } from 'exceljs';
import os from 'node:os';
import path from 'node:path';
import { ExportTarget } from './Export.ts';
import { AllowedComputedFields, CarpoolRow, CarpoolRowData } from './CarpoolRow.ts';

export type Datasources = Map<string, any>;

export type Fields = Array<keyof CarpoolRowData | keyof AllowedComputedFields>;

export type FieldFilter = { target: ExportTarget; exclusions: Partial<Fields> };

export type ComputedProcessors = Array<ComputedProcessor>;

// TODO find a way to type the compute() return type depending on the name
export type ComputedProcessor = {
  name: keyof AllowedComputedFields;
  compute: (row: CarpoolRow, datasources: Datasources) => AllowedComputedFields[keyof AllowedComputedFields] | null;
};

export type Options = {
  compress: boolean;
  dataSheetName: string;
  dataSheetOptions: Partial<AddWorksheetOptions>;
  helpSheetName: string;
  helpSheetOptions: Partial<AddWorksheetOptions>;
  fields: Partial<Fields>;
  computed: ComputedProcessors;
  datasources: Datasources;
};

export class XLSXWriter {
  protected workbook: stream.xlsx.WorkbookWriter;
  protected dataSheet: Worksheet;
  protected helpSheet: Worksheet;
  protected workbookExt = 'xlsx';
  protected archiveExt = 'zip';
  protected folder: string;
  protected basename: string;
  protected options: Options = {
    compress: false,
    dataSheetName: 'Trajets',
    dataSheetOptions: {},
    helpSheetName: 'Aide',
    helpSheetOptions: {},
    fields: [],
    computed: [
      {
        name: 'campaign_mode',
        compute(row, datasources) {
          // for each campaign, get the mode at the start date or the end date
          // and return the higher one (booster)
          return row.value('campaigns', []).reduce((acc, id) => {
            const campaign = datasources.get('campaigns').get(id);
            if (!campaign) return acc;
            const mode = campaign.getModeAt([row.value('start_datetime_utc'), row.value('end_datetime_utc')]);
            return acc === 'booster' ? acc : mode;
          }, 'normal');
        },
      },
      {
        name: 'has_incentive',
        compute(row) {
          return row.hasIncentive();
        },
      },
    ],
    datasources: new Map(),
  };

  constructor(filename: string, config: Partial<Options>) {
    this.options = { ...this.options, ...config } as Options;
    this.folder = os.tmpdir();
    this.basename = this.sanitize(filename);
  }

  // TODO create the workbook and the worksheets
  public async create(): Promise<XLSXWriter> {
    // create the Excel file
    this.workbook = new stream.xlsx.WorkbookWriter({ filename: this.workbookPath, useStyles: true });

    // Add the data sheet and configure the columns
    this.dataSheet = this.workbook.addWorksheet(this.options.dataSheetName, this.options.dataSheetOptions);
    this.dataSheet.columns = this.options.fields.map((header) => ({ header, key: header }));

    // Add the help sheet
    this.helpSheet = this.workbook.addWorksheet(this.options.helpSheetName, this.options.helpSheetOptions);

    return this;
  }

  public async close(): Promise<XLSXWriter> {
    await this.workbook.commit();
    return this;
  }

  // append lines to the data sheet
  public async append(carpoolRow: CarpoolRow): Promise<XLSXWriter> {
    // add computed fields to the carpool row
    this.options.computed.forEach((field: ComputedProcessor) => {
      carpoolRow.addField(field.name, field.compute(carpoolRow, this.options.datasources));
    });

    // TODO use the XLSX library to write the line to the file
    // TODO get the list of fields from the config
    const row = carpoolRow.get(this.options.fields);
    this.dataSheet.addRow(row).commit();

    return this;
  }

  // TODO print help in a separate sheet
  public async printHelp(): Promise<XLSXWriter> {
    console.info('TODO print help');
    return this;
  }

  // TODO compress the file with ZIP (for now)
  public async compress(): Promise<XLSXWriter> {
    if (!this.options.compress) {
      console.info(`Skipped compression of ${this.workbookPath}`);
      return this;
    }

    const zip = new AdmZip();
    zip.addLocalFile(this.workbookPath);
    zip.writeZip(this.archivePath);

    return this;
  }

  public async cleanup(): Promise<XLSXWriter> {
    // TODO

    return this;
  }

  public get workbookFilename(): string {
    return `${this.basename}.${this.workbookExt}`;
  }

  public get workbookPath(): string {
    return path.join(this.folder, this.workbookFilename);
  }

  public get archiveFilename(): string {
    return `${this.basename}.${this.archiveExt}`;
  }

  public get archivePath(): string {
    return path.join(this.folder, this.archiveFilename);
  }

  public addDatasource(key: string, value: any): XLSXWriter {
    this.options.datasources.set(key, value);
    return this;
  }

  // TODO share with APDF where the code comes from
  protected sanitize(str: string): string {
    return str
      .replace(/\u20AC/g, 'e') // € -> e
      .normalize('NFD')
      .replace(/[\ \.\/]/g, '_')
      .replace(/([\u0300-\u036f]|[^\w-_\ ])/g, '')
      .replace('_-_', '-')
      .toLowerCase()
      .substring(0, 128);
  }
}
