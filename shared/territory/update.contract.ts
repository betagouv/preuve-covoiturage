import { TerritoryBaseInterface, TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface Territory extends TerritoryBaseInterface {
  _id: number;
}

export interface ParamsInterface extends Territory {
  insee?: string[];
}
export interface ResultInterface extends TerritoryInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'update',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
