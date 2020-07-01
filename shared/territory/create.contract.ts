import { TerritoryBaseInterface } from './common/interfaces/TerritoryInterface';
import { TerritoryBaseRelationInterface } from './common/interfaces/TerritoryRelationInterface';
import { TerritoryCodesInterface } from './common/interfaces/TerritoryCodeInterface';
import { TerritoryDbMetaInterface } from './common/interfaces/TerritoryDbMetaInterface';

export interface GeoMultiPoly {
  type: 'MultiPolygon';
  coordinates: number[][][2];
}

export interface ParamsInterface extends TerritoryBaseInterface, Partial<TerritoryCodesInterface> {
  children: TerritoryBaseRelationInterface;
  ui_status: any;
  geo?: GeoMultiPoly;
}

export interface ResultInterface extends TerritoryBaseInterface, TerritoryDbMetaInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
