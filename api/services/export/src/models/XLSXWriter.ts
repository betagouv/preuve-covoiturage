import os from 'node:os';
import path from 'node:path';
import { CarpoolRow } from './CarpoolRow';

export type Datasources = Map<string, any>;

export type ComputedField = {
  name: string;
  compute: (row: CarpoolRow, datasources: Datasources) => any;
};

export type Options = {
  compress: boolean;
  dataSheetName: string;
  helpSheetName: string;
  fields: string[];
  computed: ComputedField[];
  datasources: Datasources;
};

export class XLSXWriter {
  protected rawExt = 'xlsx';
  protected compressedExt = 'zip';
  protected folder: string;
  protected path: string;
  protected filename: string;
  protected options: Options;

  protected readonly defaultConfig: Options = {
    compress: true,
    dataSheetName: 'Trajets',
    helpSheetName: 'Aide',
    fields: [],
    computed: [],
    datasources: new Map(),
  };

  constructor(filename: string, config: Partial<Options>) {
    this.options = { ...this.defaultConfig, ...config } as Options;
    this.folder = os.tmpdir();
    this.filename = this.sanitize(filename);
    this.path = path.join(this.folder, `${this.filename}.${this.rawExt}`);
  }

  // TODO create the workbook and the worksheets

  // append lines to the data sheet
  public append(carpoolRow: CarpoolRow): XLSXWriter {
    // add computed fields to the carpool row
    this.options.computed.forEach((field: ComputedField) => {
      carpoolRow.addField(field.name, field.compute(carpoolRow, this.options.datasources));
    });

    // TODO use the XLSX library to write the line to the file
    // TODO get the list of fields from the config
    const row = carpoolRow.get(this.options.fields);
    console.debug(row);

    return this;
  }

  // TODO print help in a separate sheet
  public printHelp(): XLSXWriter {
    return this;
  }

  // TODO compress the file with ZIP (for now)
  public compress(): XLSXWriter {
    // TODO
    this.filename = path.join(this.folder, `${this.filename}.${this.compressedExt}`);
    return this;
  }

  public remove(): XLSXWriter {
    // TODO

    return this;
  }

  public getFilename(): string {
    return this.filename;
  }

  public getPath(): string {
    return this.path;
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
