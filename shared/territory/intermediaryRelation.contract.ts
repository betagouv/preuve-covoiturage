import { TerritoryChildrenInterface } from './common/interfaces/TerritoryChildrenInterface';

export interface ParamsInterface {
  _id: number;
}

export type ResultInterface = TerritoryChildrenInterface[];

export const handlerConfig = {
  service: 'territory',
  method: 'getIntermediaryRelation',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
