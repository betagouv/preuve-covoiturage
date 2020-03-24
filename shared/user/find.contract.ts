import { UserFindInterface } from './common/interfaces/UserFindInterface';

export interface ParamsInterface {
  _id: number;
}

export interface ResultInterface extends UserFindInterface {}

export const handlerConfig = {
  service: 'user',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
