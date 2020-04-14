import { TerritoryCodesInterface, TerritoryCodeEnum } from './common/interfaces/TerritoryCodeInterface';
import { GeoPositionInterface } from '../common/interfaces/GeoPositionInterface';
import {
  SortEnum,
  BasicFieldEnum,
  ActiveFieldEnum,
  GeoFieldEnum,
  RelationFiedEnum,
} from './common/interfaces/TerritoryQueryInterface';
import { TerritoryBaseInterface } from './common/interfaces/TerritoryInterface';
import { TerritoryDbMetaInterface } from './common/interfaces/TerritoryDbMetaInterface';
import { TerritoryRelationInterface } from './common/interfaces/TerritoryRelationInterface';

interface QueryParamsInterface extends Partial<TerritoryCodesInterface> {
  _id?: number;
  position?: GeoPositionInterface;
  active?: boolean;
}

export interface ParamsInterface {
  query: QueryParamsInterface;
  sort: SortEnum;
  projection: BasicFieldEnum | ActiveFieldEnum | GeoFieldEnum | RelationFiedEnum | TerritoryCodeEnum;
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
