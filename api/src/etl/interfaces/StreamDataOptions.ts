import type { CsvOptions, StreamJsonOptions as JsonOptions } from '@/deps.ts';
export type { CsvOptions };
export type { JsonOptions };

export interface XlsxOptions {
  name?: string;
  startRow?: number;
}

export type StreamDataOptions = CsvOptions | XlsxOptions | JsonOptions | undefined;
