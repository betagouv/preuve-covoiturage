import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

export interface ParamsInterface {
  insee: string;
}
export interface ResultInterface extends TerritoryInterface {
  _id: number;
}
export const handlerConfig = {
  service: 'territory',
  method: 'findByInsee',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
