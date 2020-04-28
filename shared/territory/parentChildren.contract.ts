import { TerritoryParentChildrenInterface } from './common/interfaces/TerritoryChildrenInterface';

export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = TerritoryParentChildrenInterface;

export const handlerConfig = {
  service: 'territory',
  method: 'getParentChildren',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
