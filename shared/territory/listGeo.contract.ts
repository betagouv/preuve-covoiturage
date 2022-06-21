import { PaginationParamsInterface } from '../common/interfaces/PaginationParamsInterface';
import { ResultWithPagination } from '../common/interfaces/ResultWithPagination';
import { GeoCodeTypeEnum } from './common/geo';

export interface ParamsInterface extends Partial<PaginationParamsInterface> {
  search: string;
  where?: {
    insee?: string[];
  };
}

export interface SingleResultInterface {
  _id: number;
  name: string;
  insee: string;
  type: GeoCodeTypeEnum;
}

export type ResultInterface = ResultWithPagination<SingleResultInterface[]>;

export const handlerConfig = {
  service: 'territory',
  method: 'listGeo',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
