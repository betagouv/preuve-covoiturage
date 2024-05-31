import { Options as CsvOptions } from 'csv-parse';
import { FilterOptions as JsonOptions } from 'stream-json/filters/FilterBase.js';
export { CsvOptions };
export { JsonOptions };

export interface XlsxOptions {
  name?: string;
  startRow?: number;
}

export type StreamDataOptions = CsvOptions | XlsxOptions | JsonOptions | undefined;
