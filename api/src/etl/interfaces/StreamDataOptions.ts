import type { Options as CsvOptions } from 'csv-parse';
import type { FilterOptions as JsonOptions } from 'stream-json/filters/FilterBase.js';
export type { CsvOptions };
export type { JsonOptions };

export interface XlsxOptions {
  name?: string;
  startRow?: number;
}

export type StreamDataOptions = CsvOptions | XlsxOptions | JsonOptions | undefined;
