import { ResultWithPagination } from '../common/interfaces/ResultWithPagination.ts';
import { PaginationParamsInterface } from '../common/interfaces/PaginationParamsInterface.ts';

export interface ParamsInterface extends PaginationParamsInterface {
  search: string;
}

interface SingleResultInterface {
  _id: number;
  name: string;
}

export type ResultInterface = ResultWithPagination<SingleResultInterface>;

export const handlerConfig = {
  service: 'territory',
  method: 'list',
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
