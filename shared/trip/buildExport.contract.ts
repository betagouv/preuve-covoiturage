import { TerritorySelectorsInterface } from '../territory/common/interfaces/TerritoryCodeInterface.ts';
import { ExportType } from './sendExport.contract.ts';

export interface FormatInterface {
  tz: string;
  filename?: string;
}

export interface QueryInterface {
  date: {
    start: Date;
    end: Date;
  };
  operator_id?: number[];
  geo_selector?: TerritorySelectorsInterface;
}

export interface ParamsInterface {
  format?: FormatInterface;
  query?: QueryInterface;
  type?: ExportType;
}

export type ResultInterface = string;

export const handlerConfig = {
  service: 'trip',
  method: 'buildExport',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
