import { UserStatusInterface } from './common/interfaces/UserStatusInterface';
import { PaginationParamsInterface } from '../common/interfaces/PaginationParamsInterface';
import { PaginationResultInterface } from '../common/interfaces/PaginationResultInterface';

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
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
