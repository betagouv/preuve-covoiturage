import { TerritoryCodesInterface, TerritoryCodeEnum } from './common/interfaces/TerritoryCodeInterface';
import { GeoPositionInterface } from '../common/interfaces/GeoPositionInterface';
import { SortEnum, ProjectionFieldsEnum } from './common/interfaces/TerritoryQueryInterface';
import { TerritoryBaseInterface } from './common/interfaces/TerritoryInterface';
import { TerritoryDbMetaInterface } from './common/interfaces/TerritoryDbMetaInterface';
import { TerritoryRelationInterface } from './common/interfaces/TerritoryRelationInterface';

export interface QueryParamsInterface extends Partial<TerritoryCodesInterface> {
  _id?: number;
  position?: GeoPositionInterface;
  active?: boolean;
}

export interface ParamsInterface {
  query: QueryParamsInterface;
  sort: SortEnum[];
  projection: ProjectionFieldsEnum;
}

export interface ResultInterface
  extends Partial<TerritoryBaseInterface>,
    Partial<TerritoryDbMetaInterface>,
    Partial<TerritoryCodesInterface>,
    Partial<TerritoryRelationInterface> {}

export const handlerConfig = {
  service: 'territory',
  method: 'find',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
