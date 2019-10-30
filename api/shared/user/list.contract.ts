import { UserStatusInterface } from './common/interfaces/UserStatusInterface';
import { PaginationParamsInterface } from '../common/interfaces/PaginationParamsInterface';
import { PaginationResultInterface } from '../common/interfaces/PaginationResultInterface';

export interface ParamsInterface extends PaginationParamsInterface {}

export interface ResultInterface {
  data: UserStatusInterface[];
  meta: { pagination: PaginationResultInterface };
}

export const configHandler = {
  service: 'user',
  method: 'list',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
