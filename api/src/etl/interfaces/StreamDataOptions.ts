import { Options as CsvOptions } from 'csv-parse';
import type { FilterOptions as JsonOptions } from 'stream-json/filters/FilterBase.ts';
export { CsvOptions };
export { JsonOptions };

export interface XlsxOptions {
  name?: string;
  startRow?: number;
}

export type StreamDataOptions = CsvOptions | XlsxOptions | JsonOptions | undefined;
