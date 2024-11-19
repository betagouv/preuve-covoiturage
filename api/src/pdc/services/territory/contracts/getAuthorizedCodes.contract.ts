import { TerritorySelectorsInterface } from './common/interfaces/TerritoryCodeInterface.ts';

export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = TerritorySelectorsInterface;

export const handlerConfig = {
  service: 'territory',
  method: 'getAuthorizedCodes',
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
