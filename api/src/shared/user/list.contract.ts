import { UserStatusInterface } from './common/interfaces/UserStatusInterface.ts';
import { PaginationParamsInterface } from '../common/interfaces/PaginationParamsInterface.ts';
import { PaginationResultInterface } from '../common/interfaces/PaginationResultInterface.ts';

export interface ParamsInterface extends PaginationParamsInterface {
  operator_id?: number;
  territory_id?: number;
}

export interface ResultInterface {
  data: UserStatusInterface[];
  meta: { pagination: PaginationResultInterface };
}

export const handlerConfig = {
  service: 'user',
  method: 'list',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
