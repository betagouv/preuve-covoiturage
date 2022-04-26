import { TerritoryCodesInterface } from './common/interfaces/TerritoryCodeInterface';

export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = TerritoryCodesInterface;

export const handlerConfig = {
  service: 'territory',
  method: 'getAuthorizedCodes',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
