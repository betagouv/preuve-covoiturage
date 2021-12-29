import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface extends TerritoryInterface {
  insee?: string[];
}
export interface ResultInterface extends TerritoryInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'update',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
