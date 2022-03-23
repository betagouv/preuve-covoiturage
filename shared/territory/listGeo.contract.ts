import { PaginationParamsInterface } from '../common/interfaces/PaginationParamsInterface';
import { ResultWithPagination } from '../common/interfaces/ResultWithPagination';
import { GeoCodeTypeEnum } from './common/geo';

export interface ParamsInterface extends Partial<PaginationParamsInterface> {
  search?: string;
  type?: GeoCodeTypeEnum;
  where?: {
    _id?: number[];
  };
}

export interface SingleResultInterface {
  _id: number;
  code: string;
  label: string;
  insee: string;
}

export type ResultInterface = ResultWithPagination<SingleResultInterface[]>;

export const handlerConfig = {
  service: 'territory',
  method: 'listGeo',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
