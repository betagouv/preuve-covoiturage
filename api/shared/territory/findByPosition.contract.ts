import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface {
  lat: Number;
  lon: Number;
}

export interface ResultInterface extends TerritoryInterface {
  _id: string;
}

export const configHandler = {
  service: 'territory',
  method: 'findByPosition',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
