import { TerritoryCodesInterface } from './common/interfaces/TerritoryCodeInterface';
import { TerritoryBaseInterface, TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface extends TerritoryBaseInterface, Partial<TerritoryCodesInterface> {}

export interface ResultInterface extends TerritoryInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
