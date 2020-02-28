import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

interface TerritoryIdInterface extends TerritoryInterface {
  _id: number;
}

export type ParamsInterface = void;
export type ResultInterface = { data: TerritoryIdInterface[]; meta: any };
export const handlerConfig = {
  service: 'territory',
  method: 'list',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
