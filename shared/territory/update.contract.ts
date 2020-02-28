import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

interface Territory extends TerritoryInterface {
  _id: number;
}

export interface ParamsInterface extends Territory {}
export interface ResultInterface extends Territory {}
export const handlerConfig = {
  service: 'territory',
  method: 'update',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
