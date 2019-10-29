import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

interface TerritoryIdInterface extends TerritoryInterface {
  _id: string;
}

export type ParamsInterface = void;
export type ResultInterface = { data: TerritoryIdInterface[]; meta: any };
export const configHandler = {
  service: 'territory',
  method: 'list',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
