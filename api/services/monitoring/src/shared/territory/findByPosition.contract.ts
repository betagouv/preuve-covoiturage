import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface {
  lat: number;
  lon: number;
}

export interface ResultInterface extends TerritoryInterface {
  _id: number;
}

export const handlerConfig = {
  service: 'territory',
  method: 'findByPosition',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
