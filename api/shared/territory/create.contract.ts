import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface extends TerritoryInterface {}

export interface ResultInterface extends TerritoryInterface {
  _id: string;
}

export const configHandler = {
  service: 'territory',
  method: 'create',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
