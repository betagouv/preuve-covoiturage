import { UserCreateInterface } from './common/interfaces/UserCreateInterface';
import { UserFindInterface } from './common/interfaces/UserFindInterface';

export interface ParamsInterface extends UserCreateInterface {}

export type ResultInterface = UserFindInterface;

export const handlerConfig = {
  service: 'user',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
