import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface {
  insee: string;
}
export interface ResultInterface extends TerritoryInterface {
  _id: string;
}
export const configHandler = {
  service: 'territory',
  method: 'findByInsee',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
