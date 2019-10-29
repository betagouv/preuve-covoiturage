import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface {
  _id: string;
}
export interface ResultInterface extends TerritoryInterface {
  _id: string;
}
export const configHandler = {
  service: 'territory',
  method: 'find',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
