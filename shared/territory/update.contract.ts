import { TerritoryBaseInterface } from './common/interfaces/TerritoryInterface';
import { TerritoryDbMetaInterface } from './common/interfaces/TerritoryDbMetaInterface';
import { TerritoryBaseRelationInterface } from './common/interfaces/TerritoryRelationInterface';

export interface Territory extends TerritoryBaseInterface {
  _id: number;
}

export interface ParamsInterface extends Territory {
  children: TerritoryBaseRelationInterface;
  ui_status: any;
  insee?: string[];
}
export interface ResultInterface extends TerritoryBaseInterface, TerritoryDbMetaInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'update',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
