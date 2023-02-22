import { TerritorySelectorsInterface } from '../territory/common/interfaces/TerritoryCodeInterface';

export interface BaseParamsInterface {
  tz?: string;
  date: {
    start: Date;
    end: Date;
  };
  // eslint-disable-next-line max-len
  operator_id?: number[]; //optional operator_id(s) fetch from form (for a territory), fetched context from middleware if operator
  geo_selector?: TerritorySelectorsInterface;
}

export type ParamsInterface = BaseParamsInterface;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'export',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
