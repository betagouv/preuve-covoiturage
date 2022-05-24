import { TerritorySelectorsInterface } from './common/interfaces/TerritoryCodeInterface';

export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = TerritorySelectorsInterface;

export const handlerConfig = {
  service: 'territory',
  method: 'getAuthorizedCodes',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
