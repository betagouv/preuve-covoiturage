import { TerritoryInterface } from './common/interfaces/TerritoryInterface';

interface Territory extends TerritoryInterface {
  _id: string;
}

export interface ParamsInterface {
  _id: string;
}
export type ResultInterface = void;
export const configHandler = {
  service: 'territory',
  method: 'delete',
};
export const signature = `${configHandler.service}:${configHandler.method}`;
