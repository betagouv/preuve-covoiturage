import AdmZip from 'adm-zip';
import { AddWorksheetOptions, Worksheet, stream } from 'exceljs';
import os from 'node:os';
import path from 'node:path';
import { ExportType } from '../repositories/ExportRepository';
import { AllowedComputedFields, CarpoolRow, CarpoolRowData } from './CarpoolRow';
import { get } from 'lodash';

export type Datasources = Map<string, any>;

export type Fields = Array<keyof CarpoolRowData | keyof AllowedComputedFields>;

export type FieldFilter = { type: ExportType; exclusions: Partial<Fields> };

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
    compress: true,
    dataSheetName: 'Trajets',
    dataSheetOptions: {},
    helpSheetName: 'Aide',
    helpSheetOptions: {},
    fields: [],
    computed: [
      {
        name: 'campaign_mode',
        compute(row, datasources) {
          const campaign = datasources.get('campaigns').get(row.value('campaign_id'));
          return campaign && campaign.getModeAt([row.value('start_datetime_utc'), row.value('end_datetime_utc')]);
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

    // add computed fields and build the list to explide incentive data in many fields
    this.options.computed = [...this.options.computed, ...this.computeIncentivesFunctions()];
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

  protected computeIncentivesFunctions(): ComputedProcessors {
    return this.options.fields
      .filter((fieldName) => fieldName.startsWith('incentive_'))
      .flatMap((fieldName: keyof AllowedComputedFields) => {
        const [type, index, ...parts] = fieldName.split('_').reverse();
        const dbName = parts.reverse().join('_') as keyof Pick<
          CarpoolRowData,
          'incentive' | 'incentive_rpc' | 'incentive_counterpart'
        >;
        return {
          name: fieldName,
          compute(row): AllowedComputedFields[typeof fieldName] | null {
            const src = row.value(dbName);
            const idx = parseInt(index);
            const val = get(src, `${(isNaN(idx) ? 0 : idx) - 1}.${type}`, null);
            return type === 'amount' && val ? parseInt(val) / 100 : val;
          },
        };
      });
  }
}
