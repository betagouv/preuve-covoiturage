import { TerritoryBaseInterface } from './common/interfaces/TerritoryInterface';
import { TerritoryDbMetaInterface } from './common/interfaces/TerritoryDbMetaInterface';

export interface Territory extends TerritoryBaseInterface {
  _id: number;
}

export interface ParamsInterface extends Territory {}
export interface ResultInterface extends TerritoryBaseInterface, TerritoryDbMetaInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'update',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
