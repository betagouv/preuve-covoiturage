import { TerritoryBaseInterface } from './common/interfaces/TerritoryInterface';
import { TerritoryCodesInterface } from './common/interfaces/TerritoryCodeInterface';
import { TerritoryDbMetaInterface } from './common/interfaces/TerritoryDbMetaInterface';


export interface ParamsInterface extends TerritoryBaseInterface, Partial<TerritoryCodesInterface> {}

export interface ResultInterface extends TerritoryBaseInterface, TerritoryDbMetaInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
