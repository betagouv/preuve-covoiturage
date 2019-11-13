import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface {
  _id: number;
}
export interface ResultInterface extends TerritoryInterface {
  _id: number;
}
export const configHandler = {
  service: 'territory',
  method: 'find',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
