import { TerritorySelectorsInterface } from '../territory/common/interfaces/TerritoryCodeInterface';
import { ExportType } from './sendExport.contract';

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
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
