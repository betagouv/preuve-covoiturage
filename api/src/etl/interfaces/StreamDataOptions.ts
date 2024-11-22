import type { CsvOptions } from "@/deps.ts";
export type { CsvOptions };

export interface XlsxOptions {
  name?: string;
  startRow?: number;
}
export interface JsonOptions {
  filter: string;
}

export type StreamDataOptions =
  | CsvOptions
  | XlsxOptions
  | JsonOptions
  | undefined;
