import { UserStatusInterface } from './common/interfaces/UserStatusInterface';
import { PaginationPageParamsInterface } from '../common/interfaces/PaginationPageParamsInterface';
import { PaginationResultInterface } from '../common/interfaces/PaginationResultInterface';

export interface ParamsInterface extends PaginationPageParamsInterface {}

export interface ResultInterface {
  data: UserStatusInterface[];
  meta: { pagination: PaginationResultInterface };
}

export const configHandler = {
  service: 'user',
  method: 'list',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
