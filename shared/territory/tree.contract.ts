import { TerritoryBaseInterface } from './common/interfaces/TerritoryInterface';
import { TerritoryDbMetaInterface } from './common/interfaces/TerritoryDbMetaInterface';

export interface Territory extends TerritoryBaseInterface {
  _id: number;
}

export type ParamsInterface = void;
export interface ResultInterface extends TerritoryBaseInterface, TerritoryDbMetaInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'tree',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
