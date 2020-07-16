import {
  TerritoryQueryInterface,
  SortEnum,
  BasicFieldEnum,
  PaginationInterface,
} from './common/interfaces/TerritoryQueryInterface';
import { TerritoryLevelEnum } from './common/interfaces/TerritoryInterface';

import { ResultWithPagination } from '../common/interfaces/ResultWithPagination';

export interface ParamsInterface extends PaginationInterface {
  query: TerritoryQueryInterface;
  sort: SortEnum;
  projection: BasicFieldEnum;
}

interface SingleResultInterface {
  _id?: number;
  name?: string;
  level?: TerritoryLevelEnum;
  active?: boolean;
}

export type ResultInterface = ResultWithPagination<SingleResultInterface>;

export const handlerConfig = {
  service: 'territory',
  method: 'list',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
